package middleware

import (
	"log"
	"net/http"
	"runtime/debug"
	"strings"
)

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
	for _, origin := range allowedOrigins {
		origin = strings.TrimSpace(origin)
		if origin != "" && origin != "*" {
			allowed[origin] = struct{}{}
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			next.ServeHTTP(w, r)
			return
		}
		if _, ok := allowed[origin]; !ok {
			writeError(w, http.StatusForbidden, "origin is not allowed")
			return
		}

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Add("Vary", "Origin")

		if r.Method == http.MethodOptions {
			if !isAllowedCORSMethod(r.Header.Get("Access-Control-Request-Method")) ||
				!areAllowedCORSHeaders(r.Header.Get("Access-Control-Request-Headers")) {
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
