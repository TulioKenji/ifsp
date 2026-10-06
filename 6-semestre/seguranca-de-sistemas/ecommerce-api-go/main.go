package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"time"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/routes"
)

func main() {
	db, err := database.Open(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	handler := handlers.New(auth.Service{
		Users:    models.UserModel{DB: db},
		Sessions: models.SessionModel{DB: db},
	})
	server := &http.Server{
		Addr:    ":8080",
		Handler: middleware.Recover(
			log.Default(),
			middleware.SecurityHeaders(routes.New(handler)),
		),
		ReadTimeout: 10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout: 60 * time.Second,
	}

	log.Printf("API listening at http://localhost%s", server.Addr)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
