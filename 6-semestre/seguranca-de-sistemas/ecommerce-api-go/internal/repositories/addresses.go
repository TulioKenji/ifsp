package repositories

import (
	"context"
	"database/sql"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"fmt"
)

type AddressStore struct{ DB *sql.DB }

const addressColumns = `id,recipient_name,postal_code,street,number,COALESCE(complement,''),neighborhood,city,state,country,created_at,updated_at`

type scanner interface{ Scan(...any) error }

func scanAddress(row scanner) (models.SavedAddress, error) {
	var a models.SavedAddress
	err := row.Scan(&a.ID, &a.RecipientName, &a.PostalCode, &a.Street, &a.Number, &a.Complement, &a.Neighborhood, &a.City, &a.State, &a.Country, &a.CreatedAt, &a.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		err = models.ErrNotFound
	}
	return a, err
}
func (s AddressStore) List(ctx context.Context, user string) ([]models.SavedAddress, error) {
	rows, err := s.DB.QueryContext(ctx, `SELECT `+addressColumns+` FROM user_addresses WHERE user_id=$1 AND archived_at IS NULL ORDER BY created_at,id LIMIT 20`, user)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []models.SavedAddress{}
	for rows.Next() {
		a, err := scanAddress(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, a)
	}
	return out, rows.Err()
}
func (s AddressStore) Save(ctx context.Context, user, id string, a models.Address) (models.SavedAddress, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return models.SavedAddress{}, err
	}
	defer tx.Rollback()
	// Lock por usuário mantém o teto de 20 endereços mesmo com cadastros simultâneos.
	var owner string
	if err = tx.QueryRowContext(ctx, `SELECT id FROM users WHERE id=$1 FOR NO KEY UPDATE`, user).Scan(&owner); err != nil {
		return models.SavedAddress{}, err
	}
	args := []any{user, a.RecipientName, a.PostalCode, a.Street, a.Number, a.Complement, a.Neighborhood, a.City, a.State, a.Country}
	var out models.SavedAddress
	if id == "" {
		var count int
		if err = tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM user_addresses WHERE user_id=$1 AND archived_at IS NULL`, user).Scan(&count); err != nil {
			return out, err
		}
		if count >= 20 {
			return out, fmt.Errorf("%w: limite de 20 endereços", validation.ErrInput)
		}
		out, err = scanAddress(tx.QueryRowContext(ctx, `INSERT INTO user_addresses(user_id,recipient_name,postal_code,street,number,complement,neighborhood,city,state,country) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING `+addressColumns, args...))
	} else {
		args = append(args, id)
		out, err = scanAddress(tx.QueryRowContext(ctx, `UPDATE user_addresses SET recipient_name=$2,postal_code=$3,street=$4,number=$5,complement=$6,neighborhood=$7,city=$8,state=$9,country=$10 WHERE user_id=$1 AND id=$11 AND archived_at IS NULL RETURNING `+addressColumns, args...))
	}
	if err != nil {
		return out, err
	}
	err = tx.Commit()
	return out, err
}
func (s AddressStore) Archive(ctx context.Context, user, id string) error {
	// Soft delete preserva a FK e a cópia histórica dos pedidos existentes.
	r, err := s.DB.ExecContext(ctx, `UPDATE user_addresses SET archived_at=NOW(),is_default=FALSE WHERE user_id=$1 AND id=$2 AND archived_at IS NULL`, user, id)
	if err != nil {
		return err
	}
	n, err := r.RowsAffected()
	if err == nil && n == 0 {
		return models.ErrNotFound
	}
	return err
}

func ownedAddress(ctx context.Context, tx *sql.Tx, user, id string) (models.Address, error) {
	a, err := scanAddress(tx.QueryRowContext(ctx, `SELECT `+addressColumns+` FROM user_addresses WHERE user_id=$1 AND id=$2 AND archived_at IS NULL FOR SHARE`, user, id))
	return a.Address, err
}
