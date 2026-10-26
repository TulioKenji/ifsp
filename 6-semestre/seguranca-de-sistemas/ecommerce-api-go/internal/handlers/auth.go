package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/validation"
)

type credentialsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name,omitempty"`
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
	if err := validation.NewPassword(request.Password); err != nil {
		writeError(w, 400, err.Error())
		return
	}

	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	_, err := h.service.Register(ctx, request.Email, request.Password, request.Name)
	if err != nil {
		if database.IsUniqueViolation(err) {
			writeError(w, http.StatusConflict, "email already registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}

	w.WriteHeader(http.StatusCreated)
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

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("PRODUCTION") == "1",
		SameSite: http.SameSiteLaxMode,
		Expires:  session.ExpiresAt,
		MaxAge:   int(time.Until(session.ExpiresAt).Seconds()),
	})
	writeJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"csrf_token": auth.CSRFToken(token),
	})
}

func (h *authHandler) Session(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	user, err := h.service.Users.ByID(ctx, middleware.CurrentUser(r).UserID)
	if err != nil {
		writeError(w, 503, "conta indisponível")
		return
	}
	cookie, _ := r.Cookie("session_token")
	writeJSON(w, 200, map[string]string{"id": user.ID, "email": user.Email, "name": user.Name, "csrf_token": auth.CSRFToken(cookie.Value)})
}

func (h *authHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	if err := h.service.Sessions.Delete(ctx, middleware.CurrentUser(r).SessionID); err != nil {
		writeError(w, 503, "não foi possível sair")
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "session_token", Path: "/", HttpOnly: true, Secure: os.Getenv("PRODUCTION") == "1", SameSite: http.SameSiteLaxMode, MaxAge: -1})
	w.WriteHeader(http.StatusNoContent)
}

func decodeCredentials(w http.ResponseWriter, r *http.Request) (credentialsRequest, bool) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return credentialsRequest{}, false
	}

	var request credentialsRequest
	if !decodeJSON(w, r, &request) {
		return credentialsRequest{}, false
	}
	return request, true
}

func validateCredentials(request credentialsRequest) error {
	if !validation.PlainText(request.Name) {
		return errors.New("name must be valid text without control characters")
	}
	if len(request.Email) > 320 || len(request.Name) > 150 {
		return errors.New("email ou nome muito longo")
	}
	if strings.TrimSpace(request.Email) == "" || !strings.Contains(request.Email, "@") {
		return errors.New("email is invalid")
	}
	parsedEmail, err := mail.ParseAddress(request.Email)
	if err != nil || parsedEmail.Address != strings.TrimSpace(request.Email) {
		return errors.New("email is invalid")
	}
	if request.Password == "" {
		return errors.New("informe sua senha")
	}
	if !validation.PasswordCandidate(request.Password) {
		return errors.New("senha muito longa ou inválida; reduza a quantidade de caracteres")
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
