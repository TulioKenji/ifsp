package server

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"ecommerce-api-go/internal/config"
)

func testServer(t *testing.T, max, perIP int) (*http.Server, *boundedListener) {
	t.Helper()
	cfg := config.Settings{Addr: "127.0.0.1:0", RatePerMinute: 180, Inflight: 16}
	s := New(cfg, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	inner, err := net.Listen("tcp", cfg.Addr)
	if err != nil {
		t.Fatal(err)
	}
	l := BoundListener(inner, max, perIP).(*boundedListener)
	done := make(chan error, 1)
	go func() { done <- s.Serve(l) }()
	t.Cleanup(func() { _ = s.Close(); <-done })
	return s, l
}

func TestNativeTLSAndSecurityHeaders(t *testing.T) {
	s := New(config.Settings{RatePerMinute: 180, Inflight: 16}, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	test := httptest.NewUnstartedServer(s.Handler)
	test.Config = s
	test.TLS = s.TLSConfig.Clone()
	test.StartTLS()
	defer test.Close()
	res, err := test.Client().Get(test.URL)
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != 204 || res.Header.Get("Strict-Transport-Security") == "" || res.TLS.Version < tls.VersionTLS12 {
		t.Fatal("TLS policy or HSTS missing")
	}
	legacy := test.Client().Transport.(*http.Transport).TLSClientConfig.Clone()
	legacy.MinVersion = tls.VersionTLS10
	legacy.MaxVersion = tls.VersionTLS11
	conn, err := tls.DialWithDialer(&net.Dialer{Timeout: time.Second}, "tcp", test.Listener.Addr().String(), legacy)
	if err == nil {
		conn.Close()
		t.Fatal("legacy TLS accepted")
	}
}

func waitConnections(t *testing.T, l *boundedListener, count int) {
	t.Helper()
	until := time.Now().Add(2 * time.Second)
	for time.Now().Before(until) {
		l.mu.Lock()
		n := l.total
		l.mu.Unlock()
		if n == count {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatal("connection count did not recover")
}

func TestSocketLimitAndRelease(t *testing.T) {
	_, l := testServer(t, 2, 1)
	first, err := net.DialTimeout("tcp", l.Addr().String(), time.Second)
	if err != nil {
		t.Fatal(err)
	}
	defer first.Close()
	waitConnections(t, l, 1)
	second, err := net.DialTimeout("tcp", l.Addr().String(), time.Second)
	if err != nil {
		t.Fatal(err)
	}
	defer second.Close()
	_ = second.SetDeadline(time.Now().Add(time.Second))
	_, _ = io.WriteString(second, "GET / HTTP/1.1\r\nHost: localhost\r\n\r\n")
	if _, err = bufio.NewReader(second).ReadByte(); err == nil {
		t.Fatal("excess per-IP socket accepted")
	} else if e, ok := err.(net.Error); ok && e.Timeout() {
		t.Fatal("rejected socket was queued instead of closed")
	}
	_ = first.Close()
	waitConnections(t, l, 0)
	client := &http.Client{Timeout: time.Second, Transport: &http.Transport{DisableKeepAlives: true}}
	res, err := client.Get("http://" + l.Addr().String())
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != 204 {
		t.Fatal("server did not recover")
	}
}

func TestSlowHeadersTimeoutAndRecovery(t *testing.T) {
	s, l := testServer(t, 8, 8)
	if s.ReadHeaderTimeout != 3*time.Second || s.MaxHeaderBytes != 16<<10 {
		t.Fatal("unexpected production HTTP limits")
	}
	c, err := net.DialTimeout("tcp", l.Addr().String(), time.Second)
	if err != nil {
		t.Fatal(err)
	}
	defer c.Close()
	_ = c.SetDeadline(time.Now().Add(5 * time.Second))
	_, _ = io.WriteString(c, "GET / HTTP/1.1\r\nHost: localhost\r\nX-Slow: ")
	start := time.Now()
	_, err = bufio.NewReader(c).ReadByte()
	if err == nil || time.Since(start) > 4500*time.Millisecond {
		t.Fatalf("slow header was not closed by timeout: %v", err)
	}
	waitConnections(t, l, 0)
	res, err := (&http.Client{Timeout: time.Second}).Get("http://" + l.Addr().String())
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != 204 {
		t.Fatal("healthy request rejected after timeout")
	}
}

func TestHTTPParserRejectsSmugglingAndOversizedHeaders(t *testing.T) {
	_, l := testServer(t, 8, 8)
	for _, tc := range []struct {
		raw    string
		status int
	}{
		{"POST / HTTP/1.1\r\nHost: local\r\nContent-Length: 1\r\nContent-Length: 2\r\n\r\nx", 400},
		{"POST / HTTP/1.1\r\nHost: local\r\nTransfer-Encoding: chunked\r\nContent-Length: 4\r\n\r\n0\r\n\r\n", 400},
		{"GET / HTTP/1.1\r\nHost: local\r\nX-Huge: " + strings.Repeat("a", 64<<10) + "\r\n\r\n", 431},
	} {
		c, err := net.DialTimeout("tcp", l.Addr().String(), time.Second)
		if err != nil {
			t.Fatal(err)
		}
		_ = c.SetDeadline(time.Now().Add(2 * time.Second))
		_, _ = io.WriteString(c, tc.raw)
		res, err := http.ReadResponse(bufio.NewReader(c), nil)
		if err != nil {
			c.Close()
			t.Fatal(err)
		}
		res.Body.Close()
		c.Close()
		if res.StatusCode != tc.status {
			t.Fatalf("HTTP parser status=%d want=%d (%s)", res.StatusCode, tc.status, fmt.Sprintf("%.50s", tc.raw))
		}
	}
}
