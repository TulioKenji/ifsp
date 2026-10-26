// Package billing contém cadastro do perfil e meios de pagamento didáticos.
// Não há gateway, autorização bancária ou cobrança real.
package billing

import (
	"context"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/secrets"
	"ecommerce-api-go/internal/validation"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"
)

type Store interface {
	Profile(context.Context, string) (models.Profile, error)
	SaveProfile(context.Context, string, models.ProtectedProfile) (models.Profile, error)
	Cards(context.Context, string) ([]models.CreditCard, error)
	AddCard(context.Context, string, models.ProtectedCard) (models.CreditCard, error)
	ArchiveCard(context.Context, string, string) error
}
type Reauthenticator interface {
	Reauthenticate(context.Context, string, string) error
}
type Service struct {
	Store Store
	Auth  Reauthenticator
	Vault *secrets.Vault
	Now   func() time.Time
}

func (s Service) Profile(ctx context.Context, user string) (models.Profile, error) {
	return s.Store.Profile(ctx, user)
}
func (s Service) SaveProfile(ctx context.Context, user string, in models.ProfileInput) (models.Profile, error) {
	cpf, ok := validation.CPF(in.CPF)
	if !ok {
		return models.Profile{}, fmt.Errorf("%w: CPF inválido", validation.ErrInput)
	}
	phone, ok := validation.Phone(in.Phone)
	if !ok {
		return models.Profile{}, fmt.Errorf("%w: telefone brasileiro inválido", validation.ErrInput)
	}
	if err := s.Auth.Reauthenticate(ctx, user, in.CurrentPassword); err != nil {
		return models.Profile{}, err
	}
	data := models.ProtectedProfile{CPF: s.Vault.Seal(cpf, "profile:"+user+":cpf"), Phone: s.Vault.Seal(phone, "profile:"+user+":phone"), CPFMasked: "***.***.***-" + cpf[9:], PhoneMasked: "+55 (**) *****-" + phone[len(phone)-4:]}
	return s.Store.SaveProfile(ctx, user, data)
}
func (s Service) Cards(ctx context.Context, user string) ([]models.CreditCard, error) {
	return s.Store.Cards(ctx, user)
}
func (s Service) AddCard(ctx context.Context, user string, in models.CardInput) (models.CreditCard, error) {
	pan, brand, ok := validation.PAN(in.Number)
	if !ok {
		return models.CreditCard{}, fmt.Errorf("%w: cartão inválido (Visa, Mastercard ou Amex)", validation.ErrInput)
	}
	name := strings.TrimSpace(in.HolderName)
	if name == "" || utf8.RuneCountInString(name) > 150 || !validation.PlainText(name) {
		return models.CreditCard{}, fmt.Errorf("%w: titular inválido", validation.ErrInput)
	}
	now := time.Now()
	if s.Now != nil {
		now = s.Now()
	}
	now = now.UTC()
	if in.ExpMonth < 1 || in.ExpMonth > 12 || in.ExpYear < now.Year() || in.ExpYear > now.Year()+15 || (in.ExpYear == now.Year() && in.ExpMonth < int(now.Month())) {
		return models.CreditCard{}, fmt.Errorf("%w: validade inválida ou expirada", validation.ErrInput)
	}
	if err := s.Auth.Reauthenticate(ctx, user, in.CurrentPassword); err != nil {
		return models.CreditCard{}, err
	}
	fingerprint := s.Vault.Fingerprint(user, pan)
	card := models.ProtectedCard{Number: s.Vault.Seal(pan, "card:"+user+":"+fingerprint+":number"), Holder: s.Vault.Seal(name, "card:"+user+":"+fingerprint+":holder"), Fingerprint: fingerprint, Brand: brand, Last4: pan[len(pan)-4:], ExpMonth: in.ExpMonth, ExpYear: in.ExpYear}
	return s.Store.AddCard(ctx, user, card)
}
func (s Service) ArchiveCard(ctx context.Context, user, id, password string) error {
	if !validation.UUID(id) {
		return fmt.Errorf("%w: cartão inválido", validation.ErrInput)
	}
	if err := s.Auth.Reauthenticate(ctx, user, password); err != nil {
		return err
	}
	return s.Store.ArchiveCard(ctx, user, id)
}
