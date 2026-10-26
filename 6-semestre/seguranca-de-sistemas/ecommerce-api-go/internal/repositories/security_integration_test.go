package repositories_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	dbassets "ecommerce-api-go/db"
	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/routes"
	"ecommerce-api-go/internal/server"
)

func TestAdversarialHTTPWithRealPostgres(t *testing.T) {
	db := testDB(t)
	for _, file := range []string{"products.sql", "products-images.sql"} {
		script, err := dbassets.Files.ReadFile(file)
		if err != nil {
			t.Fatal(err)
		}
		if _, err = db.Exec(string(script)); err != nil {
			t.Fatal(err)
		}
	}
	var initialCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM products`).Scan(&initialCount); err != nil {
		t.Fatal(err)
	}
	authService := auth.Service{Users: models.UserModel{DB: db}, Sessions: models.SessionModel{DB: db}}
	billingService := testBilling(t, db)
	billingService.Auth = authService
	h := server.New(config.Settings{RatePerMinute: 180, Inflight: 16}, routes.New(handlers.New(authService, models.ProductModel{DB: db}), handlers.OrderHandler{Service: orders.Service{Store: repositories.OrderStore{DB: db}}}, handlers.AddressHandler{Service: addresses.Service{Store: repositories.AddressStore{DB: db}}}, handlers.BillingHandler{Service: billingService}, t.TempDir())).Handler
	for _, tc := range []struct {
		path string
		want int
	}{
		{"/api/products", 200}, {"/api/products?queryparam=" + url.QueryEscape("' OR 1=1; SELECT pg_sleep(5); --"), 200},
		{"/api/products?queryparam=" + url.QueryEscape("<script>alert(1)</script>"), 200},
		{"/api/products?field=name%3BDROP%20TABLE%20users", 400},
		{"/api/products?queryparam=%00", 400}, {"/api/products?queryparam=%FF", 400},
		{"/api/products?page=999999999999999999999999", 400}, {"/api/products?size=10000000", 400},
		{"/api/products/00000000-0000-0000-0000-000000000000%27", 400},
		{"/.env", 404}, {"/.git/config", 404}, {"/%2egit/config", 404}, {"/api/headers", 404},
		{"/api/orders", 401},
	} {
		r := httptest.NewRequest("GET", tc.path, nil)
		w := httptest.NewRecorder()
		start := time.Now()
		h.ServeHTTP(w, r)
		if w.Code != tc.want {
			t.Fatalf("%s: got %d want %d: %s", tc.path, w.Code, tc.want, w.Body)
		}
		if time.Since(start) > 2*time.Second {
			t.Fatalf("payload delayed request: %s", tc.path)
		}
		if w.Header().Get("X-Content-Type-Options") != "nosniff" || w.Header().Get("Content-Security-Policy") == "" {
			t.Fatal("missing security headers")
		}
	}
	ctx := context.Background()
	name := `<script>alert(1)</script>`
	_, err := authService.Register(ctx, "security@test.com", "long-password-testing", name)
	if err != nil {
		t.Fatal(err)
	}
	_, _, token, err := authService.Login(ctx, "security@test.com", "long-password-testing")
	if err != nil {
		t.Fatal(err)
	}
	for _, tc := range []struct {
		body string
		want int
	}{
		{`{"user_id":"other","items":[],"shipping_address":{}}`, 400},
		{`{"status":"paid","items":[],"shipping_address":{}}`, 400},
		{`{"total":"0.01","items":[],"shipping_address":{}}`, 400},
		{`{"items":[],"shipping_address":{"recipient_name":"bad\u0000text"}}`, 400},
		{`{"items":[]}{}`, 400},
		{`{"padding":"` + strings.Repeat("x", 70<<10) + `"}`, 413},
	} {
		r := httptest.NewRequest("POST", "/api/orders", strings.NewReader(tc.body))
		r.Header.Set("Content-Type", "application/json")
		r.Header.Set("X-CSRF-Token", auth.CSRFToken(token))
		r.AddCookie(&http.Cookie{Name: "session_token", Value: token})
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != tc.want {
			t.Fatalf("unsafe body: %d want=%d: %s", w.Code, tc.want, w.Body)
		}
	}
	r := httptest.NewRequest("GET", "/api/auth/session", nil)
	r.AddCookie(&http.Cookie{Name: "session_token", Value: token})
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	var session map[string]string
	if err = json.Unmarshal(w.Body.Bytes(), &session); err != nil || session["name"] != name || strings.Contains(w.Body.String(), "<script>") {
		t.Fatalf("XSS boundary: %s %v", w.Body, err)
	}
	var count int
	if err = db.QueryRow(`SELECT COUNT(*) FROM products`).Scan(&count); err != nil || count != initialCount {
		t.Fatal("catalog damaged by input", err, count)
	}
}
