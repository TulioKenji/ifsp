package handlers

import (
	"net/http"
	"path/filepath"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/models"
)

type Handler struct {
	staticIndexPath string
	auth            *authHandler
	products        *productHandler
}

func New(service auth.Service, productModel models.ProductModel) *Handler {
	return &Handler{
		staticIndexPath: filepath.Join("static", "index.html"),
		auth:            newAuthHandler(service),
		products:        newProductHandler(productModel),
	}
}

func (h *Handler) Hello(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	http.ServeFile(w, r, h.staticIndexPath)
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	h.auth.Register(w, r)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	h.auth.Login(w, r)
}

func (h *Handler) Products(w http.ResponseWriter, r *http.Request) {
	h.products.ListOrByID(w, r)
}
