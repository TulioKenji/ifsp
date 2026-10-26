package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"

	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
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

// Hash fixo válido: contas inexistentes também executam bcrypt para reduzir enumeração por tempo.
const dummyHash = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW"

func TokenHash(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

// CSRF é vinculado ao segredo da sessão, separado do hash persistido no banco.
func CSRFToken(token string) string { return TokenHash("csrf:" + token) }

func (s Service) Authenticate(ctx context.Context, token string) (models.User, models.Session, error) {
	if len(token) != 43 {
		return models.User{}, models.Session{}, ErrInvalidCredentials
	}
	session, err := s.Sessions.ByTokenHash(ctx, TokenHash(token))
	if err != nil {
		return models.User{}, session, err
	}
	user, err := s.Users.ByID(ctx, session.UserID)
	if err == nil && user.Status != "active" {
		err = ErrInvalidCredentials
	}
	return user, session, err
}

type Service struct {
	Users    models.UserModel
	Sessions models.SessionModel
	Now      func() time.Time
}

// Reautenticação confirma posse da senha em alterações sensíveis. Não cria outra
// sessão nem devolve o hash; reutiliza lockout por conta para limitar tentativas.
func (s Service) Reauthenticate(ctx context.Context, userID, password string) error {
	if !validation.PasswordCandidate(password) {
		return ErrInvalidCredentials
	}
	user, err := s.Users.ByID(ctx, userID)
	if err != nil {
		return err
	}
	if user.Status != "active" || (user.LockedUntil != nil && user.LockedUntil.After(time.Now())) {
		return ErrInvalidCredentials
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		if err = s.Users.LoginFailed(ctx, user.ID); err != nil {
			return err
		}
		return ErrInvalidCredentials
	}
	return s.Users.LoginSucceeded(ctx, user.ID)
}

func (s Service) Register(ctx context.Context, email, password, name string) (models.User, error) {
	if err := validation.NewPassword(password); err != nil {
		return models.User{}, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), passwordCost)
	if err != nil {
		return models.User{}, fmt.Errorf("hash password: %w", err)
	}

	email = strings.ToLower(strings.TrimSpace(email))
	name = strings.TrimSpace(name)
	if name == "" {
		name = "Cliente"
	}
	user, err := s.Users.Create(ctx, email, string(hash), name)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (s Service) Login(ctx context.Context, email, password string) (models.User, models.Session, string, error) {
	if !validation.PasswordCandidate(password) {
		return models.User{}, models.Session{}, "", ErrInvalidCredentials
	}
	user, err := s.Users.ByEmail(ctx, strings.ToLower(strings.TrimSpace(email)))
	if err != nil {
		if errors.Is(err, models.ErrNotFound) {
			_ = bcrypt.CompareHashAndPassword([]byte(dummyHash), []byte(password))
			return models.User{}, models.Session{}, "", ErrInvalidCredentials
		}
		return models.User{}, models.Session{}, "", err
	}
	if user.Status != "active" || (user.LockedUntil != nil && user.LockedUntil.After(time.Now())) {
		_ = bcrypt.CompareHashAndPassword([]byte(dummyHash), []byte(password))
		return models.User{}, models.Session{}, "", ErrInvalidCredentials
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		if updateErr := s.Users.LoginFailed(ctx, user.ID); updateErr != nil {
			return models.User{}, models.Session{}, "", updateErr
		}
		return models.User{}, models.Session{}, "", ErrInvalidCredentials
	}
	if err := s.Users.LoginSucceeded(ctx, user.ID); err != nil {
		if errors.Is(err, models.ErrNotFound) {
			return models.User{}, models.Session{}, "", ErrInvalidCredentials
		}
		return models.User{}, models.Session{}, "", err
	}

	rawToken := make([]byte, tokenBytes)
	if _, err := rand.Read(rawToken); err != nil {
		return models.User{}, models.Session{}, "", fmt.Errorf("generate session token: %w", err)
	}
	token := base64.RawURLEncoding.EncodeToString(rawToken)
	tokenHashHex := TokenHash(token)
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
