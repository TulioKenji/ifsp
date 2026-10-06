package models

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"
)

var ErrNotFound = errors.New("not found")

type User struct {
	ID           int64
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}

type Session struct {
	ID        int64
	UserID    int64
	TokenHash []byte
	ExpiresAt time.Time
	CreatedAt time.Time
}

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) Create(ctx context.Context, email, passwordHash string) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`INSERT INTO users (email, password_hash)
		 VALUES ($1, $2)
		 RETURNING id, email, password_hash, created_at`,
		email, passwordHash,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return User{}, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (m UserModel) ByEmail(ctx context.Context, email string) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, email, password_hash, created_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (m UserModel) ByID(ctx context.Context, id int64) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, email, password_hash, created_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (m UserModel) UpdatePassword(ctx context.Context, id int64, passwordHash string) error {
	result, err := m.DB.ExecContext(ctx,
		`UPDATE users SET password_hash = $1 WHERE id = $2`,
		passwordHash, id,
	)
	if err != nil {
		return fmt.Errorf("update user password: %w", err)
	}
	if count, err := result.RowsAffected(); err != nil {
		return fmt.Errorf("check updated user: %w", err)
	} else if count == 0 {
		return ErrNotFound
	}
	return nil
}

func (m UserModel) Delete(ctx context.Context, id int64) error {
	result, err := m.DB.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if count, err := result.RowsAffected(); err != nil {
		return fmt.Errorf("check deleted user: %w", err)
	} else if count == 0 {
		return ErrNotFound
	}
	return nil
}

type SessionModel struct {
	DB *sql.DB
}

func (m SessionModel) Create(ctx context.Context, userID int64, tokenHash []byte, expiresAt time.Time) (Session, error) {
	var session Session
	err := m.DB.QueryRowContext(ctx,
		`INSERT INTO sessions (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, token_hash, expires_at, created_at`,
		userID, tokenHash, expiresAt,
	).Scan(&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt)
	if err != nil {
		return Session{}, fmt.Errorf("create session: %w", err)
	}
	return session, nil
}

func (m SessionModel) ByTokenHash(ctx context.Context, tokenHash []byte) (Session, error) {
	var session Session
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, user_id, token_hash, expires_at, created_at
		 FROM sessions WHERE token_hash = $1 AND expires_at > NOW()`,
		tokenHash,
	).Scan(&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("find session: %w", err)
	}
	return session, nil
}

func (m SessionModel) Delete(ctx context.Context, id int64) error {
	_, err := m.DB.ExecContext(ctx, `DELETE FROM sessions WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}
