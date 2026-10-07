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
	ID           string
	Email        string
	Name         string
	PasswordHash string
	CreatedAt    time.Time
}

type Session struct {
	ID         string
	UserID     string
	TokenHash  string
	ExpiresAt  time.Time
	CreatedAt  time.Time
	RevokedAt  *time.Time
}

type UserModel struct {
	DB *sql.DB
}

func (m UserModel) Create(ctx context.Context, email, passwordHash, name string) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`INSERT INTO users (email, password_hash, name)
		 VALUES ($1, $2, $3)
		RETURNING id, email, name, password_hash, created_at`,
		email, passwordHash, name,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.CreatedAt)
	if err != nil {
		return User{}, fmt.Errorf("create user: %w", err)
	}
	return user, nil
}

func (m UserModel) ByEmail(ctx context.Context, email string) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, email, name, password_hash, created_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (m UserModel) ByID(ctx context.Context, id string) (User, error) {
	var user User
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, email, name, password_hash, created_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.Email, &user.Name, &user.PasswordHash, &user.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, fmt.Errorf("find user: %w", err)
	}
	return user, nil
}

func (m UserModel) UpdatePassword(ctx context.Context, id string, passwordHash string) error {
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

func (m UserModel) Delete(ctx context.Context, id string) error {
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

func (m SessionModel) Create(ctx context.Context, userID, tokenHash string, expiresAt time.Time) (Session, error) {
	var session Session
	err := m.DB.QueryRowContext(ctx,
		`INSERT INTO sessions (user_id, token_hash, expires_at)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at`,
		userID, tokenHash, expiresAt,
	).Scan(&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt, &session.RevokedAt)
	if err != nil {
		return Session{}, fmt.Errorf("create session: %w", err)
	}
	return session, nil
}

func (m SessionModel) ByTokenHash(ctx context.Context, tokenHash string) (Session, error) {
	var session Session
	err := m.DB.QueryRowContext(ctx,
		`SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
		 FROM sessions
		 WHERE token_hash = $1 AND expires_at > NOW() AND revoked_at IS NULL`,
		tokenHash,
	).Scan(&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt, &session.CreatedAt, &session.RevokedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrNotFound
	}
	if err != nil {
		return Session{}, fmt.Errorf("find session: %w", err)
	}
	return session, nil
}

func (m SessionModel) Delete(ctx context.Context, id string) error {
	_, err := m.DB.ExecContext(ctx, `UPDATE sessions SET revoked_at = NOW() WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}
