package handlers

import (
	"errors"
	"log/slog"
	"net/http"
	"strconv"

	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
)

type OrderHandler struct{ Service orders.Service }

func (h OrderHandler) Create(w http.ResponseWriter, r *http.Request) {
	var in models.CreateOrder
	if !decodeJSON(w, r, &in) {
		return
	}
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	o, err := h.Service.Create(ctx, middleware.CurrentUser(r).UserID, in)
	if err != nil {
		orderError(w, err)
		return
	}
	w.Header().Set("Location", "/api/orders/"+o.ID)
	writeJSON(w, 201, o)
}

func (h OrderHandler) List(w http.ResponseWriter, r *http.Request) {
	page, size := 1, 20
	var err error
	if p := r.URL.Query().Get("page"); p != "" {
		page, err = strconv.Atoi(p)
		if err != nil {
			page = 0
		}
	}
	if p := r.URL.Query().Get("size"); p != "" {
		size, err = strconv.Atoi(p)
		if err != nil {
			size = 0
		}
	}
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	data, total, err := h.Service.List(ctx, middleware.CurrentUser(r).UserID, page, size)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, 200, APIQueryParamsResponse[models.Order]{Pagination{page, size, total, (total + size - 1) / size}, data})
}

func (h OrderHandler) Detail(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	o, err := h.Service.ByID(ctx, middleware.CurrentUser(r).UserID, r.PathValue("id"))
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, 200, o)
}

func (h OrderHandler) Update(w http.ResponseWriter, r *http.Request) {
	var in struct {
		AddressID string `json:"address_id"`
	}
	if !decodeJSON(w, r, &in) {
		return
	}
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	o, err := h.Service.UpdateAddress(ctx, middleware.CurrentUser(r).UserID, r.PathValue("id"), in.AddressID)
	if err != nil {
		orderError(w, err)
		return
	}
	writeJSON(w, 200, o)
}

func (h OrderHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	if err := h.Service.Cancel(ctx, middleware.CurrentUser(r).UserID, r.PathValue("id")); err != nil {
		orderError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func orderError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, orders.ErrValidation):
		writeError(w, 400, err.Error())
	case errors.Is(err, models.ErrNotFound):
		writeError(w, 404, "pedido não encontrado")
	case errors.Is(err, orders.ErrConflict):
		writeError(w, 409, err.Error())
	default:
		slog.Error("order operation failed", "error", err)
		writeError(w, 500, "não foi possível processar o pedido")
	}
}
