// dbstatus exibe contagens operacionais sem alterar o banco.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"runtime"
	"time"

	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/database"
)

type metric struct {
	name  string
	query string
}

func main() {
	envPath := flag.String("env", ".env", "arquivo de configuração")
	noPause := flag.Bool("no-pause", false, "não aguardar Enter no Windows")
	flag.Parse()
	if err := config.LoadEnv(*envPath); err != nil {
		log.Fatal(err)
	}
	cfg, err := config.Read()
	if err != nil {
		log.Fatal(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	db, err := database.Open(ctx, cfg.DatabaseURL, cfg.DBConnections)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err = database.CheckSchema(ctx, db); err != nil {
		log.Fatal(err)
	}

	fmt.Println("GreenStore - estado do banco")
	fmt.Println("--------------------------------")
	for _, m := range []metric{
		{"Usuários", `SELECT COUNT(*) FROM users`},
		{"Usuários ativos", `SELECT COUNT(*) FROM users WHERE status='active'`},
		{"Sessões ativas", `SELECT COUNT(*) FROM sessions WHERE revoked_at IS NULL AND expires_at>NOW()`},
		{"Produtos", `SELECT COUNT(*) FROM products`},
		{"Produtos ativos", `SELECT COUNT(*) FROM products WHERE active`},
		{"Imagens de produtos", `SELECT COUNT(*) FROM product_images`},
		{"Endereços", `SELECT COUNT(*) FROM user_addresses`},
		{"Endereços ativos", `SELECT COUNT(*) FROM user_addresses WHERE archived_at IS NULL`},
		{"Perfis completos", `SELECT COUNT(*) FROM user_profiles`},
		{"Cartões", `SELECT COUNT(*) FROM credit_cards`},
		{"Cartões ativos", `SELECT COUNT(*) FROM credit_cards WHERE archived_at IS NULL`},
		{"Pedidos", `SELECT COUNT(*) FROM orders`},
		{"Itens de pedidos", `SELECT COUNT(*) FROM order_items`},
		{"Pagamentos", `SELECT COUNT(*) FROM payments`},
		{"Envios", `SELECT COUNT(*) FROM shipments`},
		{"Auditoria", `SELECT COUNT(*) FROM audit_logs`},
		{"Migrations", `SELECT COUNT(*) FROM schema_migrations`},
	} {
		var count int64
		if err = db.QueryRowContext(ctx, m.query).Scan(&count); err != nil {
			log.Fatalf("%s: %v", m.name, err)
		}
		fmt.Printf("%-22s %d\n", m.name+":", count)
	}
	fmt.Println("\nPedidos por status")
	rows, err := db.QueryContext(ctx, `SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY status`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	for rows.Next() {
		var status string
		var count int64
		if err = rows.Scan(&status, &count); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%-22s %d\n", status+":", count)
	}
	if err = rows.Err(); err != nil {
		log.Fatal(err)
	}
	if err = ctx.Err(); err != nil {
		log.Fatal(err)
	}
	if runtime.GOOS == "windows" && !*noPause {
		fmt.Println("\nPressione Enter para fechar...")
		_, _ = fmt.Scanln()
	}
}
