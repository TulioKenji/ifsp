package repositories_test

import (
	"context"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"golang.org/x/crypto/bcrypt"
	"strings"
	"testing"
)

func TestUnicodePasswordRegistrationAndLegacyLogin(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := auth.Service{Users: models.UserModel{DB: db}, Sessions: models.SessionModel{DB: db}}
	if _, err := svc.Register(ctx, "short@test.com", strings.Repeat("á", 6), "Teste"); !errors.Is(err, validation.ErrInput) {
		t.Fatal("short Unicode registration accepted", err)
	}
	password := strings.Repeat("á", 12)
	if _, err := svc.Register(ctx, "unicode@test.com", password, "Teste"); err != nil {
		t.Fatal(err)
	}
	user, _, _, err := svc.Login(ctx, "unicode@test.com", password)
	if err != nil {
		t.Fatal(err)
	}
	if err = svc.Reauthenticate(ctx, user.ID, password); err != nil {
		t.Fatal(err)
	}
	// Fixture representa conta feita com a política anterior (12 bytes/6 caracteres).
	legacy := strings.Repeat("á", 6)
	hash, err := bcrypt.GenerateFromPassword([]byte(legacy), 12)
	if err != nil {
		t.Fatal(err)
	}
	old, err := svc.Users.Create(ctx, "legacy-password@test.com", string(hash), "Antigo")
	if err != nil {
		t.Fatal(err)
	}
	if _, _, _, err = svc.Login(ctx, "legacy-password@test.com", legacy); err != nil {
		t.Fatal("legacy login broken", err)
	}
	if err = svc.Reauthenticate(ctx, old.ID, legacy); err != nil {
		t.Fatal("legacy confirmation broken", err)
	}
}
