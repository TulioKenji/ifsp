// Package loadtest gera carga HTTP GET limitada. Não há dependências nem processos por request.
package loadtest

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

type Options struct {
	URL                        string
	Requests, Concurrency, RPS int
	Duration                   time.Duration
	AllowRemote                bool
}
type Report struct {
	Requested         int         `json:"requested"`
	Completed         int         `json:"completed"`
	Statuses          map[int]int `json:"statuses"`
	NetworkErrors     int         `json:"network_errors"`
	FirstError        string      `json:"first_error,omitempty"`
	Seconds           float64     `json:"seconds"`
	RequestsPerSecond float64     `json:"requests_per_second"`
	P50MS             float64     `json:"p50_ms"`
	P95MS             float64     `json:"p95_ms"`
	P99MS             float64     `json:"p99_ms"`
}

func Validate(o Options) error {
	u, err := url.Parse(o.URL)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" || u.User != nil {
		return fmt.Errorf("URL HTTP(S) inválida")
	}
	ip := net.ParseIP(u.Hostname())
	if !o.AllowRemote && u.Hostname() != "localhost" && (ip == nil || !ip.IsLoopback()) {
		return fmt.Errorf("somente loopback por padrão; --allow-remote exige alvo explicitamente autorizado")
	}
	if o.Requests < 1 || o.Requests > 20000 || o.Concurrency < 1 || o.Concurrency > 64 || o.RPS < 0 || o.RPS > 500 || o.Duration < time.Second || o.Duration > time.Minute {
		return fmt.Errorf("limites: requests=1..20000, concurrency=1..64, rps=0..500, duration=1s..60s")
	}
	return nil
}

func Run(ctx context.Context, o Options) (Report, error) {
	r := Report{Requested: o.Requests, Statuses: map[int]int{}}
	if err := Validate(o); err != nil {
		return r, err
	}
	ctx, cancel := context.WithTimeout(ctx, o.Duration)
	defer cancel()
	transport := &http.Transport{MaxConnsPerHost: o.Concurrency, MaxIdleConnsPerHost: o.Concurrency,
		MaxIdleConns: o.Concurrency, MaxResponseHeaderBytes: 32 << 10, IdleConnTimeout: 5 * time.Second}
	defer transport.CloseIdleConnections()
	client := &http.Client{Transport: transport, Timeout: 5 * time.Second,
		// Não siga um redirect que poderia mudar o alvo autorizado ou medir HTML em vez da API.
		CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}
	var pace <-chan time.Time
	if o.RPS > 0 {
		ticker := time.NewTicker(time.Second / time.Duration(o.RPS))
		defer ticker.Stop()
		pace = ticker.C
	}
	var cursor atomic.Int64
	var mu sync.Mutex
	var wg sync.WaitGroup
	latencies := make([]time.Duration, 0, o.Requests)
	start := time.Now()
	for i := 0; i < o.Concurrency; i++ {
		wg.Go(func() {
			for {
				if int(cursor.Add(1)) > o.Requests {
					return
				}
				if pace != nil {
					select {
					case <-ctx.Done():
						return
					case <-pace:
					}
				}
				if ctx.Err() != nil {
					return
				}
				req, err := http.NewRequestWithContext(ctx, http.MethodGet, o.URL, nil)
				if err != nil {
					return
				}
				at := time.Now()
				res, err := client.Do(req)
				if err == nil {
					_, err = io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))
					res.Body.Close()
				}
				mu.Lock()
				r.Completed++
				latencies = append(latencies, time.Since(at))
				if err != nil {
					r.NetworkErrors++
					if r.FirstError == "" {
						r.FirstError = err.Error()
					}
				} else {
					r.Statuses[res.StatusCode]++
				}
				mu.Unlock()
			}
		})
	}
	wg.Wait()
	r.Seconds = time.Since(start).Seconds()
	r.RequestsPerSecond = float64(r.Completed) / r.Seconds
	sort.Slice(latencies, func(i, j int) bool { return latencies[i] < latencies[j] })
	percentile := func(p float64) float64 {
		if len(latencies) == 0 {
			return 0
		}
		return float64(latencies[int(float64(len(latencies)-1)*p)]) / float64(time.Millisecond)
	}
	r.P50MS = percentile(.50)
	r.P95MS = percentile(.95)
	r.P99MS = percentile(.99)
	return r, nil
}
