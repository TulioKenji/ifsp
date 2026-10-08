package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/routes"
)

func main() {
	loadDotEnv(".env")
	connectionString := os.Getenv("DATABASE_URL")
	if connectionString == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}
	db, err := database.Open(context.Background(), connectionString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	allowedOrigins := strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ",")

	handler := handlers.New(auth.Service{
		Users:    models.UserModel{DB: db},
		Sessions: models.SessionModel{DB: db},
	}, models.ProductModel{DB: db})
	server := &http.Server{
		Addr: ":8080",
		Handler: middleware.Recover(log.Default(), middleware.SecurityHeaders(
			middleware.RateLimit(120, time.Minute, middleware.LimitRequestBody(
				middleware.CORS(allowedOrigins, routes.New(handler)),
			)),
		)),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    32 << 10,
	}

	log.Printf("API listening at http://localhost%s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func loadDotEnv(path string) {
	content, err := os.ReadFile(path)
	if err != nil {
		return
	}
	for _, line := range strings.Split(string(content), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok || strings.TrimSpace(key) == "" {
			continue
		}
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if os.Getenv(strings.TrimSpace(key)) == "" {
			if err := os.Setenv(strings.TrimSpace(key), value); err != nil {
				log.Printf("could not load %s: %v", key, fmt.Errorf("set environment variable: %w", err))
			}
		}
	}
}
