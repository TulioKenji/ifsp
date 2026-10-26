package loadtest

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"ecommerce-api-go/internal/middleware"
)

func TestFloodRateLimitAndRecovery(t *testing.T) {
	app := httptest.NewServer(middleware.RateLimit(50, 100*time.Millisecond, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) })))
	defer app.Close()
	r, err := Run(context.Background(), Options{URL: app.URL, Requests: 1000, Concurrency: 16, Duration: 5 * time.Second})
	if err != nil || r.NetworkErrors != 0 || r.Completed != 1000 || r.Statuses[429] == 0 {
		t.Fatalf("flood failed: %+v %v", r, err)
	}
	for status := range r.Statuses {
		if status != 204 && status != 429 {
			t.Fatalf("unexpected HTTP %d", status)
		}
	}
	time.Sleep(110 * time.Millisecond)
	res, err := http.Get(app.URL)
	if err != nil {
		t.Fatal(err)
	}
	res.Body.Close()
	if res.StatusCode != 204 {
		t.Fatal("rate limit did not recover")
	}
	t.Logf("1000 requests: accepted=%d limited=%d p95=%.2fms, recovery=204", r.Statuses[204], r.Statuses[429], r.P95MS)
}

func TestLoadScopeAndBounds(t *testing.T) {
	o := Options{URL: "http://example.com", Requests: 10, Concurrency: 1, Duration: time.Second}
	if Validate(o) == nil {
		t.Fatal("remote scope accepted without explicit option")
	}
	o.URL = "http://127.0.0.1"
	o.Concurrency = 1000
	if Validate(o) == nil {
		t.Fatal("unbounded load accepted")
	}
}
