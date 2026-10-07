package models

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"ecommerce-api-go/internal/queryparams"
)

type ProductListItem struct {
	ID            string    `json:"id"`
	SellerID      *string   `json:"seller_id,omitempty"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Description   *string   `json:"description,omitempty"`
	Price         string    `json:"price"`
	StockQuantity int       `json:"stock_quantity"`
	SKU           *string   `json:"sku,omitempty"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	URL           *string   `json:"url"`
}

type ProductDetail struct {
	ID            string    `json:"id"`
	SellerID      *string   `json:"seller_id,omitempty"`
	Name          string    `json:"name"`
	Slug          string    `json:"slug"`
	Description   *string   `json:"description,omitempty"`
	Price         string    `json:"price"`
	StockQuantity int       `json:"stock_quantity"`
	SKU           *string   `json:"sku,omitempty"`
	Active        bool      `json:"active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	URLs          []string  `json:"url"`
}

type ProductModel struct {
	DB *sql.DB
}

func (m ProductModel) List(ctx context.Context, params queryparams.Params) ([]ProductListItem, int, error) {
	searchExpression, err := productSearchExpression(params.Field)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT p.id, p.seller_id, p.name, p.slug, p.description, p.price,
		       p.stock_quantity, p.sku, p.active, p.created_at, p.updated_at,
		       image.url, COUNT(*) OVER()
		FROM products AS p
		LEFT JOIN LATERAL (
			SELECT pi.url
			FROM product_images AS pi
			WHERE pi.product_id = p.id
			ORDER BY pi.sort_order, pi.id
			LIMIT 1
		) AS image ON TRUE
		WHERE p.active = TRUE`
	args := make([]any, 0, 3)
	if params.Query != "" {
		query += " AND " + searchExpression + " @@ websearch_to_tsquery('simple', $1)"
		args = append(args, params.Query)
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC, id LIMIT $%d OFFSET $%d", len(args)+1, len(args)+2)
	args = append(args, params.Size, params.Offset())

	rows, err := m.DB.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("list products: %w", err)
	}
	defer rows.Close()

	products := make([]ProductListItem, 0, params.Size)
	total := 0
	for rows.Next() {
		var product ProductListItem
		if err := rows.Scan(
			&product.ID, &product.SellerID, &product.Name, &product.Slug,
			&product.Description, &product.Price, &product.StockQuantity,
			&product.SKU, &product.Active, &product.CreatedAt, &product.UpdatedAt,
			&product.URL,
			&total,
		); err != nil {
			return nil, 0, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, product)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate products: %w", err)
	}

	return products, total, nil
}

func (m ProductModel) ByID(ctx context.Context, id string) (ProductDetail, error) {
	var product ProductDetail
	var rawURLs string
	err := m.DB.QueryRowContext(ctx, `
		SELECT p.id, p.seller_id, p.name, p.slug, p.description, p.price,
		       p.stock_quantity, p.sku, p.active, p.created_at, p.updated_at,
		       COALESCE((
			   SELECT json_agg(pi.url ORDER BY pi.sort_order, pi.id)
			   FROM product_images AS pi
			   WHERE pi.product_id = p.id
		       ), '[]'::json)::text
		FROM products AS p
		WHERE p.id = $1 AND p.active = TRUE`, id,
	).Scan(
		&product.ID, &product.SellerID, &product.Name, &product.Slug,
		&product.Description, &product.Price, &product.StockQuantity,
		&product.SKU, &product.Active, &product.CreatedAt, &product.UpdatedAt,
		&rawURLs,
	)
	if err == sql.ErrNoRows {
		return ProductDetail{}, ErrNotFound
	}
	if err != nil {
		return ProductDetail{}, fmt.Errorf("find product: %w", err)
	}
	if err := json.Unmarshal([]byte(rawURLs), &product.URLs); err != nil {
		return ProductDetail{}, fmt.Errorf("decode product images: %w", err)
	}
	return product, nil
}

func productSearchExpression(field string) (string, error) {
	switch field {
	case "all":
		return "to_tsvector('simple', name || ' ' || coalesce(description, '') || ' ' || coalesce(sku, ''))", nil
	case "name":
		return "to_tsvector('simple', name)", nil
	case "description":
		return "to_tsvector('simple', coalesce(description, ''))", nil
	case "sku":
		return "to_tsvector('simple', coalesce(sku, ''))", nil
	default:
		return "", fmt.Errorf("field must be one of: all, name, description, sku")
	}
}
