package bootstrap_test

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"
	"testing"
	"time"

	"ecommerce-api-go/internal/bootstrap"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/queryparams"
	"github.com/jackc/pgx/v5"
)

func TestCreateDatabaseSeedRepeatAndRepair(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL ausente")
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()
	cfg, err := pgx.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	admin, err := pgx.ConnectConfig(ctx, cfg)
	if err != nil {
		t.Fatal(err)
	}
	cfg.Database = fmt.Sprintf("bootstrap_test_%d", time.Now().UnixNano())
	t.Cleanup(func() {
		defer admin.Close(context.Background())
		if _, err := admin.Exec(context.Background(), "DROP DATABASE "+pgx.Identifier{cfg.Database}.Sanitize()+" WITH (FORCE)"); err != nil {
			t.Error(err)
		}
	})
	targetDSN := dsn + " dbname=" + cfg.Database
	if strings.HasPrefix(dsn, "postgres://") || strings.HasPrefix(dsn, "postgresql://") {
		u, err := url.Parse(dsn)
		if err != nil {
			t.Fatal(err)
		}
		u.Path = "/" + cfg.Database
		targetDSN = u.String()
	}
	result, err := bootstrap.Prepare(ctx, targetDSN, dsn)
	if err != nil {
		t.Fatal(err)
	}
	if !result.Created || result.Products < 1 || result.Images != result.Products || len(result.Migrations) != 5 {
		t.Fatalf("unexpected installation: %+v", result)
	}
	db, err := database.Open(ctx, targetDSN)
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()
	if err = database.CheckSchema(ctx, db); err != nil {
		t.Fatal(err)
	}
	var productID string
	if err = db.QueryRow(`SELECT id FROM products ORDER BY id LIMIT 1`).Scan(&productID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(`UPDATE products SET stock_quantity=3,price=17.99 WHERE id=$1`, productID); err != nil {
		t.Fatal(err)
	}
	again, err := bootstrap.Prepare(ctx, targetDSN, dsn)
	if err != nil || again.Created || again.Products != 0 || again.Images != 0 || len(again.Migrations) != 0 {
		t.Fatalf("not idempotent: %+v %v", again, err)
	}
	p, err := (models.ProductModel{DB: db}).ByID(ctx, productID)
	if err != nil || p.StockQuantity != 3 || p.Price != "17.99" || len(p.URLs) != 1 {
		t.Fatalf("seed changed existing values: %+v %v", p, err)
	}
	for _, term := range []string{"", p.Name} {
		rows, total, err := (models.ProductModel{DB: db}).List(ctx, queryparams.Params{IDs: []string{productID}, Page: 1, Size: 50, Field: "name", Query: term})
		if err != nil || total != 1 || len(rows) != 1 || rows[0].ID != productID {
			t.Fatalf("bulk products: %+v total=%d %v", rows, total, err)
		}
	}
	for _, q := range []string{"", "ssd", "' OR 1=1 --", "<script>alert(1)</script>"} {
		data, total, err := (models.ProductModel{DB: db}).List(ctx, queryparams.Params{Page: 1, Size: 20, Field: "all", Query: q})
		if err != nil {
			t.Fatal(err)
		}
		if q == "" && (len(data) != 20 || int64(total) != result.Products) {
			t.Fatal("catalog pagination incorrect")
		}
		for _, p := range data {
			if p.URL == nil {
				t.Fatalf("seed product has no image: %s", p.Slug)
			}
		}
	}
	// Simula apenas no banco descartável a base antiga sem tabela de imagens.
	if _, err = db.Exec(`DROP TABLE product_images; DELETE FROM schema_migrations WHERE version='002_product_images.sql'`); err != nil {
		t.Fatal(err)
	}
	repair, err := bootstrap.Prepare(ctx, targetDSN, dsn)
	if err != nil || repair.Products != 0 || repair.Images != result.Products {
		t.Fatalf("repair failed: %+v %v", repair, err)
	}
	t.Logf("seed=%d products/%d images; repeat inserted 0; partial image schema repaired", result.Products, result.Images)
	// Simula schema legado com pedido já existente: a migration não pode perder
	// o snapshot nem inserir o endereço histórico na agenda ativa do cliente.
	if _, err = db.Exec(`ALTER TABLE orders DROP CONSTRAINT orders_address_owner_fk;
	 ALTER TABLE orders DROP COLUMN address_id;
	 DELETE FROM schema_migrations WHERE version='003_user_order_addresses.sql';
	 INSERT INTO users(email,password_hash,name) VALUES('legacy@test.com','hash','Antigo');
	 INSERT INTO orders(user_id,subtotal,total,shipping_recipient_name,shipping_postal_code,shipping_street,shipping_number,shipping_neighborhood,shipping_city,shipping_state,card_required)
	 SELECT id,10,10,'Antigo','12345','Rua antiga','1','Centro','Cidade antiga','SP',FALSE FROM users WHERE email='legacy@test.com'`); err != nil {
		t.Fatal(err)
	}
	backfill, err := bootstrap.Prepare(ctx, targetDSN, dsn)
	if err != nil || len(backfill.Migrations) != 1 {
		t.Fatalf("legacy backfill: %+v %v", backfill, err)
	}
	var historical bool
	if err = db.QueryRow(`SELECT o.shipping_city='Cidade antiga' AND a.city='Cidade antiga' AND a.archived_at IS NOT NULL AND a.user_id=o.user_id FROM orders o JOIN user_addresses a ON a.id=o.address_id`).Scan(&historical); err != nil || !historical {
		t.Fatal("legacy address snapshot lost", err)
	}
	// Recria apenas neste banco isolado o estado anterior à migration de cartões.
	if _, err = db.Exec(`ALTER TABLE orders DROP CONSTRAINT orders_card_owner_fk;
	 ALTER TABLE orders DROP CONSTRAINT orders_card_required;
	 ALTER TABLE orders DROP COLUMN credit_card_id,DROP COLUMN card_brand,DROP COLUMN card_last4,DROP COLUMN card_required;
	 DROP TABLE credit_cards; DROP TABLE user_profiles;
	 DELETE FROM schema_migrations WHERE version='005_sensitive_profile_cards.sql'`); err != nil {
		t.Fatal(err)
	}
	if _, err = bootstrap.Prepare(ctx, targetDSN, dsn); err != nil {
		t.Fatal(err)
	}
	var legacyOK bool
	if err = db.QueryRow(`SELECT NOT card_required AND credit_card_id IS NULL AND shipping_city='Cidade antiga' FROM orders`).Scan(&legacyOK); err != nil || !legacyOK {
		t.Fatal("legacy order altered by cards migration", err)
	}
	if _, err = db.Exec(`INSERT INTO orders(user_id,address_id,subtotal,total,shipping_recipient_name,shipping_postal_code,shipping_street,shipping_number,shipping_neighborhood,shipping_city,shipping_state)
	 SELECT user_id,address_id,10,10,'Teste','12345','Rua','1','Centro','Cidade','SP' FROM orders LIMIT 1`); err == nil {
		t.Fatal("new order without card accepted by database")
	}
}
