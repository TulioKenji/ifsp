package handlers

import (
	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"log/slog"
	"net/http"
)

type AddressHandler struct{ Service addresses.Service }

func (h AddressHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	out, err := h.Service.List(ctx, middleware.CurrentUser(r).UserID)
	if err != nil {
		addressError(w, err)
		return
	}
	writeJSON(w, 200, out)
}
func (h AddressHandler) Save(w http.ResponseWriter, r *http.Request) {
	var in models.Address
	if !decodeJSON(w, r, &in) {
		return
	}
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	out, err := h.Service.Save(ctx, middleware.CurrentUser(r).UserID, r.PathValue("id"), in)
	if err != nil {
		addressError(w, err)
		return
	}
	status := 200
	if r.Method == "POST" {
		status = 201
	}
	writeJSON(w, status, out)
}
func (h AddressHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	if err := h.Service.Archive(ctx, middleware.CurrentUser(r).UserID, r.PathValue("id")); err != nil {
		addressError(w, err)
		return
	}
	w.WriteHeader(204)
}
func addressError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, validation.ErrInput):
		writeError(w, 400, err.Error())
	case errors.Is(err, models.ErrNotFound):
		writeError(w, 404, "endereço não encontrado")
	default:
		slog.Error("address operation failed", "error", err)
		writeError(w, 500, "não foi possível salvar o endereço")
	}
}
