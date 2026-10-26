// Package bootstrap cuida somente da instalação. O servidor HTTP nunca cria banco nem executa DDL.
package bootstrap

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"sort"
	"strings"

	dbassets "ecommerce-api-go/db"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type Result struct {
	Created          bool
	Migrations       []string
	Products, Images int64
}

func state(err error, code string) bool {
	var e *pgconn.PgError
	return errors.As(err, &e) && e.Code == code
}

func Prepare(ctx context.Context, dsn, adminDSN string) (Result, error) {
	var out Result
	cfg, err := pgx.ParseConfig(dsn)
	if err != nil || dsn == "" {
		return out, errors.New("DATABASE_URL/DATABASE_SETUP_URL inválida ou ausente")
	}
	if cfg.Database == "" || len(cfg.Database) > 63 {
		return out, errors.New("informe um dbname de até 63 bytes")
	}
	// A instalação e os models usam o schema public; não execute SQL vindo do usuário.
	cfg.RuntimeParams["search_path"] = "public"
	conn, err := pgx.ConnectConfig(ctx, cfg)
	if state(err, "3D000") {
		admin := cfg.Copy()
		admin.Database = "postgres"
		if adminDSN != "" {
			admin, err = pgx.ParseConfig(adminDSN)
			if err != nil {
				return out, errors.New("DATABASE_ADMIN_URL inválida")
			}
		}
		maintenance, e := pgx.ConnectConfig(ctx, admin)
		if e != nil {
			return out, fmt.Errorf("conectar ao banco administrativo: %w", e)
		}
		// PostgreSQL não possui CREATE DATABASE IF NOT EXISTS; trata corrida por SQLSTATE.
		// Identificadores são escapados pelo driver, nunca concatenados sem quoting.
		_, e = maintenance.Exec(ctx, "CREATE DATABASE "+pgx.Identifier{cfg.Database}.Sanitize()+" OWNER "+pgx.Identifier{cfg.User}.Sanitize()+" TEMPLATE template0 ENCODING 'UTF8'")
		_ = maintenance.Close(ctx)
		if e != nil && !state(e, "42P04") {
			return out, fmt.Errorf("criar banco (usuário de preparação precisa CREATEDB ou DATABASE_ADMIN_URL): %w", e)
		}
		out.Created = e == nil
		conn, err = pgx.ConnectConfig(ctx, cfg)
	}
	if err != nil {
		return out, fmt.Errorf("conectar ao banco de destino: %w", err)
	}
	defer conn.Close(context.Background())
	tx, err := conn.Begin(ctx)
	if err != nil {
		return out, err
	}
	defer tx.Rollback(context.Background())
	var locked bool
	if err = tx.QueryRow(ctx, `SELECT pg_try_advisory_xact_lock(717318401)`).Scan(&locked); err != nil {
		return out, err
	}
	if !locked {
		return out, errors.New("outro dbsetup está executando neste banco")
	}
	if _, err = tx.Exec(ctx, `SET LOCAL lock_timeout='5s'; SET LOCAL statement_timeout='30s'`); err != nil {
		return out, err
	}
	core := []string{"users", "user_addresses", "sessions", "products", "categories", "product_categories", "orders", "order_items", "payments", "shipments", "audit_logs"}
	missing := []string{}
	for _, table := range core {
		var exists bool
		if err = tx.QueryRow(ctx, `SELECT to_regclass($1) IS NOT NULL`, "public."+table).Scan(&exists); err != nil {
			return out, err
		}
		if !exists {
			missing = append(missing, table)
		}
	}
	if len(missing) == len(core) {
		script, _ := dbassets.Files.ReadFile("db.sql")
		if _, err = tx.Exec(ctx, string(script)); err != nil {
			return out, fmt.Errorf("instalar schema: %w", err)
		}
	} else if len(missing) > 0 {
		return out, fmt.Errorf("schema parcial: faltam %s; faça backup e use uma base nova ou uma migration específica; nenhum dado foi apagado", strings.Join(missing, ", "))
	}
	if _, err = tx.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations
	 (version TEXT PRIMARY KEY,checksum CHAR(64) NOT NULL,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`); err != nil {
		return out, err
	}
	entries, err := dbassets.Files.ReadDir("migrations")
	if err != nil {
		return out, err
	}
	sort.Slice(entries, func(i, j int) bool { return entries[i].Name() < entries[j].Name() })
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		script, err := dbassets.Files.ReadFile("migrations/" + entry.Name())
		if err != nil {
			return out, err
		}
		hash := sha256.Sum256(script)
		checksum := hex.EncodeToString(hash[:])
		var applied string
		err = tx.QueryRow(ctx, `SELECT checksum FROM schema_migrations WHERE version=$1`, entry.Name()).Scan(&applied)
		if err == nil {
			if applied != checksum {
				return out, fmt.Errorf("migration já aplicada foi alterada: %s; crie uma nova versão", entry.Name())
			}
			continue
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return out, err
		}
		if _, err = tx.Exec(ctx, string(script)); err != nil {
			return out, fmt.Errorf("migration %s: %w", entry.Name(), err)
		}
		if _, err = tx.Exec(ctx, `INSERT INTO schema_migrations(version,checksum) VALUES ($1,$2)`, entry.Name(), checksum); err != nil {
			return out, err
		}
		out.Migrations = append(out.Migrations, entry.Name())
	}
	for _, seed := range []string{"products.sql", "products-images.sql"} {
		table := "products"
		if seed == "products-images.sql" {
			table = "product_images"
		}
		var before, after int64
		if err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM "+table).Scan(&before); err != nil {
			return out, err
		}
		script, err := dbassets.Files.ReadFile(seed)
		if err != nil {
			return out, err
		}
		_, err = tx.Exec(ctx, string(script))
		if err != nil {
			return out, fmt.Errorf("seed %s: %w", seed, err)
		}
		if seed == "products.sql" {
			if err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM products").Scan(&after); err != nil {
				return out, err
			}
			out.Products = after - before
		} else {
			if err = tx.QueryRow(ctx, "SELECT COUNT(*) FROM product_images").Scan(&after); err != nil {
				return out, err
			}
			out.Images = after - before
		}
	}
	if err = tx.Commit(ctx); err != nil {
		return out, err
	}
	return out, nil
}
