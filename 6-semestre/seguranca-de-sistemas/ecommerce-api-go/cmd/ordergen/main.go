// ordergen cria clientes de teste e pedidos reais em uma taxa limitada.
package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/billing"
	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/secrets"
)

type product struct {
	ID      string
	Options map[string]string
}

type operationResult struct {
	UserID, Email, Name string
	OrderID, Status     string
	Total, ProductID    string
	Quantity            int
}

func main() {
	envPath := flag.String("env", ".env", "arquivo de configuração")
	count := flag.Int("count", 100, "quantidade de clientes/pedidos")
	interval := flag.Duration("interval", 36*time.Second, "intervalo entre operações")
	flag.Parse()
	if *count < 1 || *count > 10000 || *interval < time.Second || *interval > time.Hour {
		log.Fatal("limites: count=1..10000 e interval=1s..1h")
	}

	if err := config.LoadEnv(*envPath); err != nil {
		log.Fatal(err)
	}
	cfg, err := config.Read()
	if err != nil {
		log.Fatal(err)
	}
	vault, err := secrets.Load(cfg.DataKeyFile)
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	db, err := database.Open(ctx, cfg.DatabaseURL, cfg.DBConnections)
	cancel()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	ctx, cancel = context.WithTimeout(context.Background(), 5*time.Second)
	if err = database.CheckSchema(ctx, db); err == nil {
		err = database.BindDataKey(ctx, db, vault)
	}
	cancel()
	if err != nil {
		log.Fatal(err)
	}

	authService := auth.Service{Users: models.UserModel{DB: db}, Sessions: models.SessionModel{DB: db}}
	profileService := billing.Service{Store: repositories.BillingStore{DB: db}, Auth: authService, Vault: vault}
	addressService := addresses.Service{Store: repositories.AddressStore{DB: db}}
	orderService := orders.Service{Store: repositories.OrderStore{DB: db}}

	var created int
	for sequence := 1; sequence <= *count; sequence++ {
		if sequence > 1 {
			time.Sleep(*interval)
		}
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		result, err := createCustomerOrder(ctx, db, authService, profileService, addressService, orderService, sequence)
		cancel()
		if err != nil {
			log.Printf("operação %d/%d falhou: %v", sequence, *count, err)
			continue
		}
		created++
		log.Printf("operação %d/%d concluída: usuário=%s email=%s id=%s; pedido=%s status=%s total=%s produto=%s quantidade=%d", sequence, *count, result.Name, result.Email, result.UserID, result.OrderID, result.Status, result.Total, result.ProductID, result.Quantity)
	}
	log.Printf("finalizado: %d de %d clientes/pedidos criados", created, *count)
	if created != *count {
		os.Exit(1)
	}
}

func createCustomerOrder(ctx context.Context, db *sql.DB, authService auth.Service, profileService billing.Service, addressService addresses.Service, orderService orders.Service, sequence int) (operationResult, error) {
	suffix := fmt.Sprintf("%d-%d", time.Now().UnixNano(), sequence)
	password := "GreenStoreLoad-2026!"
	email := "loadtest-" + suffix + "@example.invalid"
	name := fmt.Sprintf("Cliente de carga %d", sequence)
	user, err := authService.Register(ctx, email, password, name)
	if err != nil {
		return operationResult{}, fmt.Errorf("cadastrar usuário: %w", err)
	}
	if _, err = profileService.SaveProfile(ctx, user.ID, models.ProfileInput{CPF: "52998224725", Phone: "11987654321", CurrentPassword: password}); err != nil {
		return operationResult{}, fmt.Errorf("criar perfil: %w", err)
	}
	now := time.Now().UTC()
	card, err := profileService.AddCard(ctx, user.ID, models.CardInput{Number: "4111111111111111", HolderName: "Cliente de carga", ExpMonth: int(now.Month()), ExpYear: now.Year() + 2, CurrentPassword: password})
	if err != nil {
		return operationResult{}, fmt.Errorf("criar cartão de teste: %w", err)
	}
	address, err := addressService.Save(ctx, user.ID, "", models.Address{RecipientName: "Cliente de carga", PostalCode: "01001-000", Street: "Rua de Teste", Number: fmt.Sprintf("%d", sequence), Neighborhood: "Centro", City: "São Paulo", State: "SP", Country: "BR"})
	if err != nil {
		return operationResult{}, fmt.Errorf("criar endereço: %w", err)
	}
	item, err := availableProduct(ctx, db)
	if err != nil {
		return operationResult{}, err
	}
	order, err := orderService.Create(ctx, user.ID, models.CreateOrder{CreditCardID: card.ID, AddressID: address.ID, Items: []models.OrderItemInput{{ProductID: item.ID, Quantity: 1, Options: item.Options}}})
	if err != nil {
		return operationResult{}, fmt.Errorf("criar pedido: %w", err)
	}
	return operationResult{UserID: user.ID, Email: email, Name: name, OrderID: order.ID, Status: order.Status, Total: order.Total, ProductID: item.ID, Quantity: 1}, nil
}

func availableProduct(ctx context.Context, db *sql.DB) (product, error) {
	var item product
	var raw []byte
	err := db.QueryRowContext(ctx, `SELECT id::text, options FROM products WHERE active=TRUE AND stock_quantity>0 ORDER BY stock_quantity DESC,id LIMIT 1`).Scan(&item.ID, &raw)
	if err != nil {
		return item, fmt.Errorf("buscar produto com estoque: %w", err)
	}
	allowed := map[string][]string{}
	if err = json.Unmarshal(raw, &allowed); err != nil {
		return item, fmt.Errorf("ler opções do produto: %w", err)
	}
	item.Options = make(map[string]string, len(allowed))
	for key, values := range allowed {
		if len(values) == 0 || strings.TrimSpace(values[0]) == "" {
			return item, fmt.Errorf("produto %s possui opção sem valor", item.ID)
		}
		item.Options[key] = values[0]
	}
	return item, nil
}
