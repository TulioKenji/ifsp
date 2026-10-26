package database

import (
	"context"
	"database/sql"
	"errors"
)

type DataCipher interface {
	Seal(string, string) []byte
	Open([]byte, string) (string, error)
}

// BindDataKey impede iniciar com uma chave nova por engano sobre dados antigos.
// Um canário autenticado não contém informações pessoais; o segredo fica fora do DB.
func BindDataKey(ctx context.Context, db *sql.DB, v DataCipher) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.ExecContext(ctx, `SELECT pg_advisory_xact_lock(717318402)`); err != nil {
		return err
	}
	var data []byte
	err = tx.QueryRowContext(ctx, `SELECT check_cipher FROM data_key_checks WHERE id=1`).Scan(&data)
	if errors.Is(err, sql.ErrNoRows) {
		var existing bool
		if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM user_profiles) OR EXISTS(SELECT 1 FROM credit_cards WHERE number_cipher IS NOT NULL)`).Scan(&existing); err != nil {
			return err
		}
		if existing {
			return errors.New("verificação da chave ausente com dados existentes: restaure o backup; não gere outra chave")
		}
		data = v.Seal("greenstore-data-key-v1", "key-check")
		if _, err = tx.ExecContext(ctx, `INSERT INTO data_key_checks(id,check_cipher) VALUES(1,$1)`, data); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	plain, err := v.Open(data, "key-check")
	if err != nil || plain != "greenstore-data-key-v1" {
		return errors.New("DATA_KEY_FILE não corresponde ao banco: restaure a chave original; não substitua dados")
	}
	return tx.Commit()
}
