package middleware

import (
	"crypto/tls"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSensitiveDataRequiresTLSOutsideLocalDevelopment(t *testing.T) {
	h := SensitiveTransport(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(204) }))
	for _, tc := range []struct {
		remote, production string
		tls                bool
		want               int
	}{
		{"127.0.0.1:1234", "0", false, 204}, {"[::1]:1234", "0", false, 204}, {"192.0.2.1:1234", "0", false, 426},
		{"127.0.0.1:1234", "1", false, 426}, {"192.0.2.1:1234", "1", true, 204},
	} {
		t.Setenv("PRODUCTION", tc.production)
		r := httptest.NewRequest("POST", "http://localhost/api/cards", nil)
		r.RemoteAddr = tc.remote
		r.Header.Set("X-Forwarded-Proto", "https")
		if tc.tls {
			r.TLS = &tls.ConnectionState{}
		}
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != tc.want {
			t.Fatalf("transport got=%d want=%d", w.Code, tc.want)
		}
	}
}
