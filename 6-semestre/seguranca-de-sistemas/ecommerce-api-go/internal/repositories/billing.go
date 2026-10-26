package repositories

import (
	"context"
	"database/sql"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"fmt"
)

type BillingStore struct{ DB *sql.DB }

func (s BillingStore) Profile(ctx context.Context, user string) (models.Profile, error) {
	var p models.Profile
	err := s.DB.QueryRowContext(ctx, `SELECT cpf_masked,phone_masked FROM user_profiles WHERE user_id=$1`, user).Scan(&p.CPFMasked, &p.PhoneMasked)
	if errors.Is(err, sql.ErrNoRows) {
		return p, nil
	}
	p.Complete = err == nil
	return p, err
}
func (s BillingStore) SaveProfile(ctx context.Context, user string, in models.ProtectedProfile) (models.Profile, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return models.Profile{}, err
	}
	defer tx.Rollback()
	_, err = tx.ExecContext(ctx, `INSERT INTO user_profiles(user_id,cpf_cipher,phone_cipher,cpf_masked,phone_masked) VALUES($1,$2,$3,$4,$5)
 ON CONFLICT(user_id) DO UPDATE SET cpf_cipher=EXCLUDED.cpf_cipher,phone_cipher=EXCLUDED.phone_cipher,cpf_masked=EXCLUDED.cpf_masked,phone_masked=EXCLUDED.phone_masked,updated_at=NOW()`, user, in.CPF, in.Phone, in.CPFMasked, in.PhoneMasked)
	if err != nil {
		return models.Profile{}, err
	}
	if err = billingAudit(ctx, tx, user, user, "profile.updated", "user"); err != nil {
		return models.Profile{}, err
	}
	err = tx.Commit()
	return models.Profile{Complete: true, CPFMasked: in.CPFMasked, PhoneMasked: in.PhoneMasked}, err
}

const cardColumns = `id,brand,last4,exp_month,exp_year,created_at`

func scanCard(row scanner) (models.CreditCard, error) {
	var c models.CreditCard
	err := row.Scan(&c.ID, &c.Brand, &c.Last4, &c.ExpMonth, &c.ExpYear, &c.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		err = models.ErrNotFound
	}
	return c, err
}
func (s BillingStore) Cards(ctx context.Context, user string) ([]models.CreditCard, error) {
	rows, err := s.DB.QueryContext(ctx, `SELECT `+cardColumns+` FROM credit_cards WHERE user_id=$1 AND archived_at IS NULL ORDER BY created_at,id LIMIT 10`, user)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []models.CreditCard{}
	for rows.Next() {
		c, err := scanCard(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
func (s BillingStore) AddCard(ctx context.Context, user string, in models.ProtectedCard) (models.CreditCard, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return models.CreditCard{}, err
	}
	defer tx.Rollback()
	// Mesmo lock de usuário usado pela agenda. Serializa cadastros e mantém quota.
	var owner string
	if err = tx.QueryRowContext(ctx, `SELECT id FROM users WHERE id=$1 FOR NO KEY UPDATE`, user).Scan(&owner); err != nil {
		return models.CreditCard{}, err
	}
	var count int
	if err = tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM credit_cards WHERE user_id=$1 AND archived_at IS NULL`, user).Scan(&count); err != nil {
		return models.CreditCard{}, err
	}
	if count >= 10 {
		return models.CreditCard{}, fmt.Errorf("%w: limite de 10 cartões ativos", validation.ErrInput)
	}
	c, err := scanCard(tx.QueryRowContext(ctx, `INSERT INTO credit_cards(user_id,number_cipher,holder_cipher,fingerprint,brand,last4,exp_month,exp_year) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING `+cardColumns, user, in.Number, in.Holder, in.Fingerprint, in.Brand, in.Last4, in.ExpMonth, in.ExpYear))
	if err != nil {
		return c, err
	}
	if err = billingAudit(ctx, tx, user, c.ID, "card.created", "credit_card"); err != nil {
		return c, err
	}
	err = tx.Commit()
	return c, err
}
func (s BillingStore) ArchiveCard(ctx context.Context, user, id string) error {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	// Remove os ciphertexts que já não serão usados. Só a referência e a máscara
	// continuam no histórico; cópias em backups seguem a política de retenção.
	result, err := tx.ExecContext(ctx, `UPDATE credit_cards SET archived_at=NOW(),number_cipher=NULL,holder_cipher=NULL WHERE user_id=$1 AND id=$2 AND archived_at IS NULL`, user, id)
	if err != nil {
		return err
	}
	n, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return models.ErrNotFound
	}
	if err = billingAudit(ctx, tx, user, id, "card.archived", "credit_card"); err != nil {
		return err
	}
	return tx.Commit()
}
func billingAudit(ctx context.Context, tx *sql.Tx, user, id, action, kind string) error {
	// Sem payload, CPF, telefone, titular, PAN, fingerprint ou senha no log.
	_, err := tx.ExecContext(ctx, `INSERT INTO audit_logs(user_id,action,resource_type,resource_id) VALUES($1,$2,$3,$4)`, user, action, kind, id)
	return err
}
func ownedCard(ctx context.Context, tx *sql.Tx, user, id string) (models.CreditCard, error) {
	return scanCard(tx.QueryRowContext(ctx, `SELECT `+cardColumns+` FROM credit_cards WHERE user_id=$1 AND id=$2 AND archived_at IS NULL
 AND (exp_year>EXTRACT(YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC') OR (exp_year=EXTRACT(YEAR FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC') AND exp_month>=EXTRACT(MONTH FROM CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))) FOR SHARE`, user, id))
}
