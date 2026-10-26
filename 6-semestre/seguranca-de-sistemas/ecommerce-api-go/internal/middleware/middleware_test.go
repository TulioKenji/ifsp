package middleware

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/models"
)

type fakeAuth struct{ err error }

func (f fakeAuth) Authenticate(context.Context, string) (models.User, models.Session, error) {
	return models.User{ID: "owner"}, models.Session{ID: "session"}, f.err
}

func TestRotatingIPsCannotGrowLimiterWithoutBound(t *testing.T) {
	h := RateLimit(2, time.Minute, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	accepted, refused := 0, 0
	for i := 0; i < 5000; i++ {
		r := httptest.NewRequest("GET", "/", nil)
		r.RemoteAddr = fmt.Sprintf("192.0.%d.%d:1234", i/256, i%256)
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		switch w.Code {
		case 204:
			accepted++
		case 503:
			refused++
		default:
			t.Fatalf("unexpected status %d", w.Code)
		}
	}
	if accepted != 4096 || refused != 904 {
		t.Fatalf("unbounded limiter: accepted=%d refused=%d", accepted, refused)
	}
	r := httptest.NewRequest("GET", "/", nil)
	r.RemoteAddr = "192.0.0.0:9876"
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	if w.Code != 204 {
		t.Fatal("existing client rejected only because the map was full")
	}
}

func TestSessionRequiresCookieAndCSRF(t *testing.T) {
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if CurrentUser(r).UserID != "owner" {
			t.Error("missing identity")
		}
		w.WriteHeader(204)
	})
	for _, tc := range []struct {
		method, token, csrf string
		want                int
	}{
		{"GET", "", "", 401}, {"GET", "secret", "", 204}, {"PUT", "secret", "", 403},
		{"DELETE", "secret", "wrong", 403}, {"PUT", "secret", auth.CSRFToken("secret"), 204},
	} {
		r := httptest.NewRequest(tc.method, "/api/orders", nil)
		if tc.token != "" {
			r.AddCookie(&http.Cookie{Name: "session_token", Value: tc.token})
		}
		r.Header.Set("X-CSRF-Token", tc.csrf)
		w := httptest.NewRecorder()
		Session(fakeAuth{}, next).ServeHTTP(w, r)
		if w.Code != tc.want {
			t.Errorf("%s csrf=%q: got %d want %d", tc.method, tc.csrf, w.Code, tc.want)
		}
	}
	r := httptest.NewRequest("GET", "/", nil)
	r.AddCookie(&http.Cookie{Name: "session_token", Value: "expired"})
	w := httptest.NewRecorder()
	Session(fakeAuth{models.ErrNotFound}, next).ServeHTTP(w, r)
	if w.Code != 401 {
		t.Fatalf("expired session: %d", w.Code)
	}
}

func TestCORS(t *testing.T) {
	h := CORS([]string{"https://shop.example"}, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	for _, tc := range []struct {
		origin, method, preflight, headers string
		want                               int
		credentials                        string
	}{
		{"https://any.example", "GET", "", "", 204, ""},
		{"https://any.example", "POST", "", "", 403, ""},
		{"https://any.example", "OPTIONS", "DELETE", "X-CSRF-Token", 403, ""},
		{"https://shop.example", "OPTIONS", "DELETE", "Content-Type, X-CSRF-Token", 204, "true"},
		{"https://shop.example", "OPTIONS", "PUT", "X-Evil", 403, "true"},
	} {
		r := httptest.NewRequest(tc.method, "https://api.example/api/orders", nil)
		r.Header.Set("Origin", tc.origin)
		r.Header.Set("Access-Control-Request-Method", tc.preflight)
		r.Header.Set("Access-Control-Request-Headers", tc.headers)
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != tc.want || w.Header().Get("Access-Control-Allow-Credentials") != tc.credentials {
			t.Errorf("CORS %+v: %d %v", tc, w.Code, w.Header())
		}
		if tc.origin == "https://any.example" && w.Header().Get("Access-Control-Allow-Origin") != "*" {
			t.Error("public read not allowed")
		}
	}
}

func TestRateLimitIgnoresSpoofedForwardedFor(t *testing.T) {
	h := RateLimit(2, time.Minute, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	for i := 0; i < 3; i++ {
		r := httptest.NewRequest("GET", "/", nil)
		r.RemoteAddr = "127.0.0.1:123"
		r.Header.Set("X-Forwarded-For", strings.Repeat("x", i))
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if i == 2 && (w.Code != 429 || w.Header().Get("Retry-After") == "") {
			t.Fatal("rate limit bypassed")
		}
	}
}

func TestConcurrencyRejectsWithoutQueue(t *testing.T) {
	entered, release, done := make(chan struct{}), make(chan struct{}), make(chan struct{})
	h := Concurrency(1, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { close(entered); <-release }))
	go func() { defer close(done); h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil)) }()
	<-entered
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/", nil))
	close(release)
	<-done
	if w.Code != 503 {
		t.Fatal("overload was not rejected")
	}
}
