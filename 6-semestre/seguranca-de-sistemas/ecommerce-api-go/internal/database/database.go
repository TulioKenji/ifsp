package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

func Open(ctx context.Context, connectionString string, maxConnections ...int) (*sql.DB, error) {
	if connectionString == "" {
		return nil, errors.New("DATABASE_URL is required")
	}

	cfg, err := pgx.ParseConfig(connectionString)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	// Timeout também no PostgreSQL, além do context de cada handler.
	cfg.RuntimeParams["statement_timeout"] = "4000"
	cfg.RuntimeParams["lock_timeout"] = "2000"
	cfg.RuntimeParams["search_path"] = "public"
	db := stdlib.OpenDB(*cfg)
	max := 4
	if len(maxConnections) > 0 {
		max = maxConnections[0]
	}
	if max < 1 || max > 32 {
		return nil, errors.New("database pool must have 1..32 connections")
	}
	db.SetMaxOpenConns(max)
	db.SetMaxIdleConns(min(max, 2))
	db.SetConnMaxIdleTime(2 * time.Minute)
	db.SetConnMaxLifetime(30 * time.Minute)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := db.PingContext(pingCtx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return db, nil
}

// Falha cedo com diagnóstico útil, em vez de iniciar HTTP que responderá 500 a todo catálogo.
func CheckSchema(ctx context.Context, db *sql.DB) error {
	var missing string
	err := db.QueryRowContext(ctx, `SELECT COALESCE(string_agg(name,', '),'') FROM unnest(ARRAY[
	 'users','user_addresses','sessions','products','product_images','orders','order_items',
	 'payments','shipments','audit_logs','categories','product_categories','user_profiles','credit_cards','data_key_checks']) AS name
	 WHERE to_regclass('public.'||name) IS NULL`).Scan(&missing)
	if err != nil {
		return err
	}
	if missing != "" {
		return fmt.Errorf("schema ausente/incompleto (%s): execute go run ./cmd/dbsetup antes de iniciar o servidor", missing)
	}
	// Colunas novas também precisam existir: tabelas antigas sozinhas não bastam.
	rows, err := db.QueryContext(ctx, `SELECT p.options,i.options,o.address_id,o.coupon_code,o.credit_card_id,o.card_brand,o.card_last4,o.card_required,a.archived_at FROM products p,order_items i,orders o,user_addresses a LIMIT 0`)
	if err != nil {
		return fmt.Errorf("schema desatualizado: execute go run ./cmd/dbsetup antes de iniciar o servidor: %w", err)
	}
	rows.Close()
	return nil
}

func IsUniqueViolation(err error) bool {
	var sqlStateError interface{ SQLState() string }
	return errors.As(err, &sqlStateError) && sqlStateError.SQLState() == "23505"
}
