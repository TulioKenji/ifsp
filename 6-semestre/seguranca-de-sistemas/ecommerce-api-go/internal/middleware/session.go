package middleware

import (
	"context"
	"crypto/subtle"
	"errors"
	"net/http"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/models"
)

type identityKey struct{}
type Identity struct {
	UserID    string
	SessionID string
}

func CurrentUser(r *http.Request) Identity {
	i, _ := r.Context().Value(identityKey{}).(Identity)
	return i
}

// Apenas o middleware lê o cookie e injeta a identidade; handlers nunca aceitam user_id do JSON.
type Authenticator interface {
	Authenticate(context.Context, string) (models.User, models.Session, error)
}

func Session(service Authenticator, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			writeError(w, 401, "sessão necessária")
			return
		}
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		user, session, err := service.Authenticate(ctx, cookie.Value)
		if err != nil {
			if errors.Is(err, auth.ErrInvalidCredentials) || errors.Is(err, models.ErrNotFound) {
				writeError(w, 401, "sessão inválida ou expirada")
			} else {
				writeError(w, 503, "autenticação indisponível")
			}
			return
		}
		if r.Method != http.MethodGet && r.Method != http.MethodHead && r.Method != http.MethodOptions {
			if subtle.ConstantTimeCompare([]byte(r.Header.Get("X-CSRF-Token")), []byte(auth.CSRFToken(cookie.Value))) != 1 {
				writeError(w, 403, "token CSRF inválido")
				return
			}
		}
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), identityKey{}, Identity{user.ID, session.ID})))
	})
}
