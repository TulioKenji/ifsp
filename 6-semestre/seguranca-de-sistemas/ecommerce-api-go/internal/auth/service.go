package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"context"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"ecommerce-api-go/internal/models"
)

const (
	passwordCost = 12
	tokenBytes   = 32
	sessionTTL   = 24 * time.Hour
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrDuplicateEmail     = errors.New("email already registered")
)

type Service struct {
	Users    models.UserModel
	Sessions models.SessionModel
	Now      func() time.Time
}

func (s Service) Register(ctx context.Context, email, password, name string) (models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), passwordCost)
	if err != nil {
		return models.User{}, fmt.Errorf("hash password: %w", err)
	}

	email = strings.ToLower(strings.TrimSpace(email))
	name = strings.TrimSpace(name)
	if name == "" {
		name = email
	}
	user, err := s.Users.Create(ctx, email, string(hash), name)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (s Service) Login(ctx context.Context, email, password string) (models.User, models.Session, string, error) {
	user, err := s.Users.ByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			return models.User{}, models.Session{}, "", ErrInvalidCredentials
		}
		return models.User{}, models.Session{}, "", err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return models.User{}, models.Session{}, "", ErrInvalidCredentials
	}

	rawToken := make([]byte, tokenBytes)
	if _, err := rand.Read(rawToken); err != nil {
		return models.User{}, models.Session{}, "", fmt.Errorf("generate session token: %w", err)
	}
	token := base64.RawURLEncoding.EncodeToString(rawToken)
	tokenHash := sha256.Sum256([]byte(token))
	tokenHashHex := hex.EncodeToString(tokenHash[:])
	now := time.Now
	if s.Now != nil {
		now = s.Now
	}
	expiresAt := now().Add(sessionTTL)
	session, err := s.Sessions.Create(ctx, user.ID, tokenHashHex, expiresAt)
	if err != nil {
		return models.User{}, models.Session{}, "", err
	}
	return user, session, token, nil
}
