package handlers

import (
	"errors"
	"net/http"
	"strings"

	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/queryparams"
)

type productHandler struct {
	products models.ProductModel
}

type APIQueryParamsResponse[T any] struct {
	Pagination Pagination `json:"pagination"`
	Data       []T        `json:"data"`
}

type Pagination struct {
	Page       int `json:"page"`
	Size       int `json:"size"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

func newProductHandler(products models.ProductModel) *productHandler {
	return &productHandler{products: products}
}

func (h *productHandler) ListOrByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/products")
	if path == "" || path == "/" {
		h.list(w, r)
		return
	}
	id := strings.TrimPrefix(path, "/")
	if id == "" || strings.Contains(id, "/") {
		writeError(w, http.StatusNotFound, "product not found")
		return
	}
	h.byID(w, r, id)
}

func (h *productHandler) list(w http.ResponseWriter, r *http.Request) {
	params, err := queryparams.Parse(r.URL.Query())
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	products, total, err := h.products.List(ctx, params)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	writeJSON(w, http.StatusOK, APIQueryParamsResponse[models.ProductListItem]{
		Pagination: Pagination{
			Page:       params.Page,
			Size:       params.Size,
			Total:      total,
			TotalPages: (total + params.Size - 1) / params.Size,
		},
		Data: products,
	})
}

func (h *productHandler) byID(w http.ResponseWriter, r *http.Request, id string) {
	ctx, cancel := contextWithTimeout(r)
	defer cancel()
	product, err := h.products.ByID(ctx, id)
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not find product")
		return
	}
	writeJSON(w, http.StatusOK, product)
}

