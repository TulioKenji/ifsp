package handlers

import (
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/billing"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"log/slog"
	"net/http"
)

type BillingHandler struct{ Service billing.Service }

func (h BillingHandler) Profile(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	user := middleware.CurrentUser(r).UserID
	if r.Method == "GET" || r.Method == "HEAD" {
		out, err := h.Service.Profile(ctx, user)
		if err != nil {
			billingError(w, err)
			return
		}
		writeJSON(w, 200, out)
		return
	}
	var in models.ProfileInput
	if !decodeJSON(w, r, &in) {
		return
	}
	out, err := h.Service.SaveProfile(ctx, user, in)
	if err != nil {
		billingError(w, err)
		return
	}
	writeJSON(w, 200, out)
}
func (h BillingHandler) Cards(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	user := middleware.CurrentUser(r).UserID
	switch r.Method {
	case "GET", "HEAD":
		out, err := h.Service.Cards(ctx, user)
		if err != nil {
			billingError(w, err)
			return
		}
		writeJSON(w, 200, out)
	case "POST":
		var in models.CardInput
		if !decodeJSON(w, r, &in) {
			return
		}
		out, err := h.Service.AddCard(ctx, user, in)
		if err != nil {
			billingError(w, err)
			return
		}
		writeJSON(w, 201, out)
	case "DELETE":
		var in struct {
			CurrentPassword string `json:"current_password"`
		}
		if !decodeJSON(w, r, &in) {
			return
		}
		if err := h.Service.ArchiveCard(ctx, user, r.PathValue("id"), in.CurrentPassword); err != nil {
			billingError(w, err)
			return
		}
		w.WriteHeader(204)
	}
}
func billingError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, validation.ErrInput):
		writeError(w, 400, err.Error())
	case errors.Is(err, auth.ErrInvalidCredentials):
		writeError(w, 403, "Senha atual inválida ou conta temporariamente bloqueada.")
	case errors.Is(err, models.ErrNotFound):
		writeError(w, 404, "Cartão não encontrado.")
	case database.IsUniqueViolation(err):
		writeError(w, 409, "Este cartão já está cadastrado.")
	default:
		slog.Error("billing operation failed")
		writeError(w, 500, "Não foi possível processar os dados.")
	}
}
