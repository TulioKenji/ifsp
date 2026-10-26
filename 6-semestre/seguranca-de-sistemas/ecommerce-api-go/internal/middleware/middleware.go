package middleware

import (
	"log"
	"net"
	"net/http"
	"runtime/debug"
	"strconv"
	"strings"
	"sync"
	"time"
)

const maxRequestBody = 1 << 20

type rateLimiter struct {
	mu        sync.Mutex
	clients   map[string]*clientLimit
	limit     int
	window    time.Duration
	nextSweep time.Time
}

type clientLimit struct {
	started time.Time
	count   int
}

func RateLimit(limit int, window time.Duration, next http.Handler) http.Handler {
	limiter := &rateLimiter{clients: make(map[string]*clientLimit), limit: limit, window: window}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.RemoteAddr
		if host, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
			key = host
		}
		now := time.Now()
		limiter.mu.Lock()
		// Limita memória mesmo se um ataque variar IPs.
		if len(limiter.clients) >= 4096 && !now.Before(limiter.nextSweep) {
			// Não percorra 4096 entradas a cada pacote quando o mapa estiver cheio.
			limiter.nextSweep = now.Add(min(window, time.Second))
			for ip, c := range limiter.clients {
				if now.Sub(c.started) >= limiter.window {
					delete(limiter.clients, ip)
				}
			}
		}
		if _, exists := limiter.clients[key]; !exists && len(limiter.clients) >= 4096 {
			limiter.mu.Unlock()
			w.Header().Set("Retry-After", "1")
			writeError(w, 503, "rate limiter at capacity")
			return
		}
		client := limiter.clients[key]
		if client == nil || now.Sub(client.started) >= limiter.window {
			client = &clientLimit{started: now}
			limiter.clients[key] = client
		}
		client.count++
		count := client.count
		limiter.mu.Unlock()
		if count > limiter.limit {
			w.Header().Set("Retry-After", strconv.Itoa(int(limiter.window.Seconds())))
			writeError(w, http.StatusTooManyRequests, "too many requests")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func LimitRequestBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// A API recebe JSON pequeno com tamanho conhecido, sem uploads em streaming.
		// net/http prioriza Transfer-Encoding sobre Content-Length; recusamos chunked
		// por completo para evitar interpretações divergentes em futuros proxies HTTP/1.
		if len(r.TransferEncoding) > 0 {
			r.Close = true
			w.Header().Set("Connection", "close")
			writeError(w, 400, "streaming chunked não é suportado; envie JSON com tamanho conhecido")
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)
		next.ServeHTTP(w, r)
	})
}

func Recover(logger *log.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				logger.Printf("panic recovered: %v\n%s", recovered, debug.Stack())
				writeError(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'")
		if r.TLS != nil {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000")
		}
		next.ServeHTTP(w, r)
	})
}

func CORS(allowedOrigins []string, next http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		origin = strings.TrimSpace(origin)
		if origin != "*" && origin != "" {
			allowed[origin] = struct{}{}
		}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}
		_, isAllowed := allowed[origin]
		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}
		isAllowed = isAllowed || origin == scheme+"://"+r.Host
		// Leitura pública sem credenciais. Cookies só nas origens confiáveis.
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if isAllowed {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Add("Vary", "Origin")
		method := r.Method
		if method == http.MethodOptions {
			method = r.Header.Get("Access-Control-Request-Method")
		}
		if !isAllowed && method != http.MethodGet && method != http.MethodHead {
			writeError(w, 403, "configure esta origem em CORS_ALLOWED_ORIGINS")
			return
		}
		if r.Method == http.MethodOptions {
			if !isAllowedCORSMethod(r.Header.Get("Access-Control-Request-Method")) || !areAllowedCORSHeaders(r.Header.Get("Access-Control-Request-Headers")) {
				writeError(w, http.StatusForbidden, "CORS request is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token")
			w.Header().Add("Vary", "Access-Control-Request-Method")
			w.Header().Add("Vary", "Access-Control-Request-Headers")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isAllowedCORSMethod(method string) bool {
	switch method {
	case http.MethodGet, http.MethodHead, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions:
		return true
	default:
		return false
	}
}

func areAllowedCORSHeaders(headerValue string) bool {
	for _, header := range strings.Split(headerValue, ",") {
		switch strings.ToLower(strings.TrimSpace(header)) {
		case "", "content-type", "x-csrf-token":
		default:
			return false
		}
	}
	return true
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write([]byte(`{"error":"` + message + `"}`))
}

// Rejeita sobrecarga imediatamente, sem fila ilimitada de goroutines.
func Concurrency(max int, next http.Handler) http.Handler {
	sem := make(chan struct{}, max)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		select {
		case sem <- struct{}{}:
			defer func() { <-sem }()
			next.ServeHTTP(w, r)
		default:
			w.Header().Set("Retry-After", "1")
			writeError(w, 503, "servidor ocupado")
		}
	})
}
