package routes

import (
	"net/http"

	"ecommerce-api-go/internal/handlers"
)

func New(handler *handlers.Handler) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/hello", handler.Hello)
	// mux.HandleFunc("/headers", handler.Headers)
	mux.HandleFunc("/register", handler.Register)
	mux.HandleFunc("/login", handler.Login)
	mux.HandleFunc("/products", handler.Products)
	mux.HandleFunc("/products/", handler.Products)

	return mux
}
