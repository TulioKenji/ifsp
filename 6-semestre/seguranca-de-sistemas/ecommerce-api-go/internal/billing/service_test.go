package billing

import (
	"context"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"errors"
	"testing"
	"time"
)

type denyReauth struct{}

func (denyReauth) Reauthenticate(context.Context, string, string) error {
	return auth.ErrInvalidCredentials
}
func TestValidationAndReauthenticationPrecedePersistence(t *testing.T) {
	ctx := context.Background()
	svc := Service{Auth: denyReauth{}, Now: func() time.Time { return time.Date(2030, 4, 15, 0, 0, 0, 0, time.UTC) }}
	// Store/Vault nil: tocar persistência ou criptografia antes de validar causaria panic.
	if _, err := svc.SaveProfile(ctx, "owner", models.ProfileInput{CPF: "invalid", Phone: "11999999999"}); !errors.Is(err, validation.ErrInput) {
		t.Fatal(err)
	}
	if _, err := svc.SaveProfile(ctx, "owner", models.ProfileInput{CPF: "52998224725", Phone: "11999999999"}); !errors.Is(err, auth.ErrInvalidCredentials) {
		t.Fatal(err)
	}
	card := models.CardInput{Number: "4242424242424242", HolderName: "TESTE", ExpMonth: 4, ExpYear: 2030}
	if _, err := svc.AddCard(ctx, "owner", card); !errors.Is(err, auth.ErrInvalidCredentials) {
		t.Fatal(err)
	}
	card.ExpMonth = 3
	if _, err := svc.AddCard(ctx, "owner", card); !errors.Is(err, validation.ErrInput) {
		t.Fatal("expired card reached auth", err)
	}
	if err := svc.ArchiveCard(ctx, "owner", "00000000-0000-0000-0000-000000000001", ""); !errors.Is(err, auth.ErrInvalidCredentials) {
		t.Fatal(err)
	}
}
