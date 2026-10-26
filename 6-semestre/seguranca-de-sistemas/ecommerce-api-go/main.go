package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/billing"
	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/routes"
	"ecommerce-api-go/internal/secrets"
	"ecommerce-api-go/internal/server"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	if err := config.LoadEnv(".env"); err != nil {
		return err
	}
	cfg, err := config.Read()
	if err != nil {
		return err
	}
	vault, err := secrets.Load(cfg.DataKeyFile)
	if err != nil {
		return err
	}
	db, err := database.Open(context.Background(), cfg.DatabaseURL, cfg.DBConnections)
	if err != nil {
		return err
	}
	defer db.Close()
	ctx, done := context.WithTimeout(context.Background(), 5*time.Second)
	err = database.CheckSchema(ctx, db)
	if err == nil {
		err = database.BindDataKey(ctx, db, vault)
	}
	done()
	if err != nil {
		return err
	}

	authService := auth.Service{
		Users:    models.UserModel{DB: db},
		Sessions: models.SessionModel{DB: db},
	}
	handler := handlers.New(authService, models.ProductModel{DB: db})
	orderHandler := handlers.OrderHandler{Service: orders.Service{Store: repositories.OrderStore{DB: db}}}
	addressHandler := handlers.AddressHandler{Service: addresses.Service{Store: repositories.AddressStore{DB: db}}}
	billingHandler := handlers.BillingHandler{Service: billing.Service{Store: repositories.BillingStore{DB: db}, Auth: authService, Vault: vault}}
	httpServer := server.New(cfg, routes.New(handler, orderHandler, addressHandler, billingHandler, cfg.SPA))
	listener, err := net.Listen("tcp", cfg.Addr)
	if err != nil {
		return err
	}
	listener = server.BoundListener(listener, cfg.Connections, cfg.ConnectionsPerIP)
	defer listener.Close()

	log.Printf("HTTP listening at %s (pool=%d, requests=%d, connections=%d)", listener.Addr(), cfg.DBConnections, cfg.Inflight, cfg.Connections)
	stop, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	go func() {
		ticker := time.NewTicker(10 * time.Minute)
		defer ticker.Stop()
		for {
			ctx, done := context.WithTimeout(stop, 3*time.Second)
			if err := (models.SessionModel{DB: db}).Prune(ctx); err != nil && stop.Err() == nil {
				log.Printf("session cleanup: %v", err)
			}
			done()
			select {
			case <-stop.Done():
				return
			case <-ticker.C:
			}
		}
	}()
	serverErrors := make(chan error, 1)
	go func() {
		if cfg.TLSCert != "" {
			serverErrors <- httpServer.ServeTLS(listener, cfg.TLSCert, cfg.TLSKey)
		} else {
			serverErrors <- httpServer.Serve(listener)
		}
	}()
	select {
	case err := <-serverErrors:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	case <-stop.Done():
		// Aguarda Shutdown no main: retornar antes fecharia o pool durante requests ativos.
		ctx, done := context.WithTimeout(context.Background(), 15*time.Second)
		defer done()
		if err := httpServer.Shutdown(ctx); err != nil {
			log.Printf("shutdown: %v", err)
			_ = httpServer.Close()
		}
	}
	return nil
}
