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
	mu      sync.Mutex
	clients map[string]*clientLimit
	limit   int
	window  time.Duration
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
		next.ServeHTTP(w, r)
	})
}

func CORS(allowedOrigins []string, next http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	allowPublic := false
	for _, origin := range allowedOrigins {
		origin = strings.TrimSpace(origin)
		if origin == "*" {
			allowPublic = true
		} else if origin != "" {
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
		if !isAllowed && !allowPublic {
			writeError(w, http.StatusForbidden, "origin is not allowed")
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		if !allowPublic {
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Add("Vary", "Origin")
		if r.Method == http.MethodOptions {
			if !isAllowedCORSMethod(r.Header.Get("Access-Control-Request-Method")) || !areAllowedCORSHeaders(r.Header.Get("Access-Control-Request-Headers")) {
				writeError(w, http.StatusForbidden, "CORS request is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
	case http.MethodGet, http.MethodPost, http.MethodOptions:
		return true
	default:
		return false
	}
}

func areAllowedCORSHeaders(headerValue string) bool {
	for _, header := range strings.Split(headerValue, ",") {
		switch strings.ToLower(strings.TrimSpace(header)) {
		case "", "content-type", "authorization":
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
