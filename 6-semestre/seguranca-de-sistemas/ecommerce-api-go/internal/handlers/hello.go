package handlers

import (
	"net/http"
	"path/filepath"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
)

type Handler struct {
	staticIndexPath string
	auth            *authHandler
	products        *productHandler
}

func (h *Handler) Protected(next http.Handler) http.Handler {
	return middleware.Session(h.auth.service, next)
}
func (h *Handler) Session(w http.ResponseWriter, r *http.Request) { h.auth.Session(w, r) }
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request)  { h.auth.Logout(w, r) }

// Login e cadastro compartilham um único orçamento, para não multiplicar tentativas.
func (h *Handler) AuthLimits(next http.Handler) http.Handler {
	return middleware.RateLimit(10, time.Minute, middleware.Concurrency(4, next))
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
