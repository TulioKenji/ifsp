package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/mail"
	"net/http"
	"strings"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/database"
)

const maxRequestBody = 1 << 20

type credentialsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authHandler struct {
	service auth.Service
}

func newAuthHandler(service auth.Service) *authHandler {
	return &authHandler{service: service}
}

func (h *authHandler) Register(w http.ResponseWriter, r *http.Request) {
	request, ok := decodeCredentials(w, r)
	if !ok {
		return
	}
	if err := validateCredentials(request); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	user, err := h.service.Register(ctx, request.Email, request.Password)
	if err != nil {
		if database.IsUniqueViolation(err) {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"created_at": user.CreatedAt,
	})
}

func (h *authHandler) Login(w http.ResponseWriter, r *http.Request) {
	request, ok := decodeCredentials(w, r)
	if !ok {
		return
	}
	if err := validateCredentials(request); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	user, session, token, err := h.service.Login(ctx, request.Email, request.Password)
	if err != nil {
		if errors.Is(err, auth.ErrInvalidCredentials) {
			writeError(w, http.StatusUnauthorized, "invalid email or password")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not log in")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"token":      token,
		"token_type": "Bearer",
		"expires_at": session.ExpiresAt,
		"user": map[string]any{
			"id":    user.ID,
			"email": user.Email,
		},
	})
}

func decodeCredentials(w http.ResponseWriter, r *http.Request) (credentialsRequest, bool) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return credentialsRequest{}, false
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var request credentialsRequest
	if err := decoder.Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return credentialsRequest{}, false
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		writeError(w, http.StatusBadRequest, "request body must contain one JSON object")
		return credentialsRequest{}, false
	}
	return request, true
}

func validateCredentials(request credentialsRequest) error {
	if strings.TrimSpace(request.Email) == "" || !strings.Contains(request.Email, "@") {
		return errors.New("email is invalid")
	}
	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil || parsedEmail.Address != strings.TrimSpace(request.Email) {
		return errors.New("email is invalid")
	}
	if len(request.Password) < 12 {
		return errors.New("password must contain at least 12 characters")
	}
	if len(request.Password) > 72 {
		return errors.New("password must contain at most 72 characters")
	}
	return nil
}

func contextWithTimeout(r *http.Request) (context.Context, context.CancelFunc) {
	return context.WithTimeout(r.Context(), 5*time.Second)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
