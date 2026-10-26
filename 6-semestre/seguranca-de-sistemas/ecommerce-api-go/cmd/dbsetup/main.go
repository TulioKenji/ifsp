// dbsetup prepara o PostgreSQL em Windows/Linux, sem psql, Docker ou scripts específicos do SO.
package main

import (
	"context"
	"flag"
	"log"
	"os"
	"time"

	"ecommerce-api-go/internal/bootstrap"
	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/queryparams"
)

func main() {
	check := flag.Bool("check", false, "somente verificar conexão e catálogo, sem alterar dados")
	env := flag.String("env", ".env", "arquivo de configuração")
	flag.Parse()
	if err := config.LoadEnv(*env); err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	url := os.Getenv("DATABASE_URL")
	if !*check {
		if setup := os.Getenv("DATABASE_SETUP_URL"); setup != "" {
			url = setup
		}
		result, err := bootstrap.Prepare(ctx, url, os.Getenv("DATABASE_ADMIN_URL"))
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("preparação OK: banco criado=%t; migrations=%v; produtos inseridos=%d; imagens inseridas=%d", result.Created, result.Migrations, result.Products, result.Images)
	}
	db, err := database.Open(ctx, url)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err = database.CheckSchema(ctx, db); err != nil {
		log.Fatal(err)
	}
	for _, q := range []string{"", "ssd"} {
		_, total, err := (models.ProductModel{DB: db}).List(ctx, queryparams.Params{Page: 1, Size: 20, Field: "all", Query: q})
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("catálogo OK (busca=%q, total=%d)", q, total)
	}
}
