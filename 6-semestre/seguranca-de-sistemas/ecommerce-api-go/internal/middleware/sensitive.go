package middleware

import (
	"net"
	"net/http"
	"os"
)

// Dados completos não podem atravessar a rede do laboratório por HTTP. Desenvolvimento
// sem TLS é permitido só a clientes loopback e nunca quando PRODUCTION=1.
// Não se confia em X-Forwarded-Proto: no modelo atual, HTTPS termina no próprio Go.
func SensitiveTransport(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host, _, err := net.SplitHostPort(r.RemoteAddr)
		ip := net.ParseIP(host)
		local := err == nil && ip != nil && ip.IsLoopback()
		if r.TLS == nil && (os.Getenv("PRODUCTION") == "1" || !local) {
			writeError(w, 426, "Use HTTPS para acessar dados pessoais e cartões.")
			return
		}
		next.ServeHTTP(w, r)
	})
}
