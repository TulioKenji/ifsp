package routes

import (
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/middleware"
)

// Grupos compartilham middlewares pelo comportamento: público, login e privado.
func New(h *handlers.Handler, orders handlers.OrderHandler, addresses handlers.AddressHandler, billing handlers.BillingHandler, staticDir string) http.Handler {
	api := http.NewServeMux()
	api.HandleFunc("GET /api/products", h.Products)
	api.HandleFunc("GET /api/products/{id}", h.Products)
	auth := http.NewServeMux()
	auth.HandleFunc("POST /api/auth/register", h.Register)
	auth.HandleFunc("POST /api/auth/login", h.Login)
	limitedAuth := h.AuthLimits(auth)
	api.Handle("/api/auth/register", limitedAuth)
	api.Handle("/api/auth/login", limitedAuth)
	private := http.NewServeMux()
	sensitive := http.NewServeMux()
	sensitive.HandleFunc("GET /api/profile", billing.Profile)
	sensitive.HandleFunc("PUT /api/profile", billing.Profile)
	sensitive.HandleFunc("GET /api/cards", billing.Cards)
	sensitive.HandleFunc("POST /api/cards", billing.Cards)
	sensitive.HandleFunc("DELETE /api/cards/{id}", billing.Cards)
	// Limite compartilhado para escritas que verificam senha. GET não gasta bcrypt.
	limitedSensitive := middleware.RateLimit(10, time.Minute, middleware.Concurrency(2, sensitive))
	sensitiveGroup := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" || r.Method == "HEAD" {
			sensitive.ServeHTTP(w, r)
		} else {
			limitedSensitive.ServeHTTP(w, r)
		}
	})
	secureSensitive := middleware.SensitiveTransport(sensitiveGroup)
	private.Handle("/api/profile", secureSensitive)
	private.Handle("/api/cards", secureSensitive)
	private.Handle("/api/cards/", secureSensitive)
	private.HandleFunc("GET /api/addresses", addresses.List)
	private.HandleFunc("POST /api/addresses", addresses.Save)
	private.HandleFunc("PUT /api/addresses/{id}", addresses.Save)
	private.HandleFunc("DELETE /api/addresses/{id}", addresses.Delete)
	private.HandleFunc("GET /api/auth/session", h.Session)
	private.HandleFunc("POST /api/auth/logout", h.Logout)
	private.HandleFunc("GET /api/orders", orders.List)
	private.HandleFunc("POST /api/orders", orders.Create)
	private.HandleFunc("GET /api/orders/{id}", orders.Detail)
	private.HandleFunc("PUT /api/orders/{id}", orders.Update)
	private.HandleFunc("DELETE /api/orders/{id}", orders.Delete)
	protected := h.Protected(private)
	api.Handle("/api/profile", protected)
	api.Handle("/api/cards", protected)
	api.Handle("/api/cards/", protected)
	api.Handle("/api/addresses", protected)
	api.Handle("/api/addresses/", protected)
	api.Handle("/api/orders", protected)
	api.Handle("/api/orders/", protected)
	api.Handle("/api/auth/session", protected)
	api.Handle("/api/auth/logout", protected)
	api.HandleFunc("/api/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(404)
		_, _ = w.Write([]byte(`{"error":"rota não encontrada"}`))
	})
	root := http.NewServeMux()
	root.Handle("/api/", api)
	root.Handle("/api", api)
	root.Handle("/", SPA(staticDir))
	return root
}

// Fallback só para navegação: assets ausentes nunca retornam HTML com status 200.
func SPA(dir string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			w.WriteHeader(405)
			return
		}
		clean := path.Clean("/" + r.URL.Path)
		if strings.ContainsAny(clean, "\\:") || strings.Contains(clean, "/.") {
			http.NotFound(w, r)
			return
		}
		file := filepath.Join(dir, filepath.FromSlash(strings.TrimPrefix(clean, "/")))
		info, err := os.Stat(file)
		if err == nil && !info.IsDir() {
			// Vite inclui hash no nome dos assets: são públicos e podem ser cacheados.
			// index.html e respostas da API continuam no-store para não reter sessão.
			if strings.HasPrefix(clean, "/assets/") {
				w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			}
			http.ServeFile(w, r, file)
			return
		}
		if strings.HasPrefix(clean, "/assets/") || path.Ext(clean) != "" || !strings.Contains(r.Header.Get("Accept"), "text/html") {
			http.NotFound(w, r)
			return
		}
		index := filepath.Join(dir, "index.html")
		if _, err = os.Stat(index); err != nil {
			http.Error(w, "compile o SPA: npm run build", 503)
			return
		}
		http.ServeFile(w, r, index)
	})
}
