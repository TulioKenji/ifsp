package handlers

import (
	"net/http"
	"path/filepath"

	"ecommerce-api-go/internal/auth"
)

type Handler struct {
	staticIndexPath string
	auth            *authHandler
}

func New(service auth.Service) *Handler {
	return &Handler{
		staticIndexPath: filepath.Join("static", "index.html"),
		auth:            newAuthHandler(service),
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
