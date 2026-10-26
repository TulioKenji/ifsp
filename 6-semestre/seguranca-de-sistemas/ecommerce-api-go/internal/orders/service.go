// Package orders contém casos de uso independentes de HTTP e PostgreSQL.
package orders

import (
	"context"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

var ErrConflict = errors.New("pedido não pode ser alterado ou estoque insuficiente")
var ErrValidation = validation.ErrInput

type Store interface {
	Create(context.Context, string, models.CreateOrder) (models.Order, error)
	List(context.Context, string, int, int) ([]models.Order, int, error)
	ByID(context.Context, string, string) (models.Order, error)
	UpdateAddress(context.Context, string, string, string) (models.Order, error)
	Cancel(context.Context, string, string) error
}
type Service struct{ Store Store }

func (s Service) List(ctx context.Context, user string, page, size int) ([]models.Order, int, error) {
	if page < 1 || page > 10000 || size < 1 || size > 100 {
		return nil, 0, fmt.Errorf("%w: paginação inválida", ErrValidation)
	}
	return s.Store.List(ctx, user, page, size)
}
func (s Service) ByID(ctx context.Context, user, id string) (models.Order, error) {
	if !validation.UUID(id) {
		return models.Order{}, fmt.Errorf("%w: UUID inválido", ErrValidation)
	}
	return s.Store.ByID(ctx, user, id)
}
func (s Service) UpdateAddress(ctx context.Context, user, id, addressID string) (models.Order, error) {
	if !validation.UUID(id) || !validation.UUID(addressID) {
		return models.Order{}, fmt.Errorf("%w: endereço inválido", ErrValidation)
	}
	return s.Store.UpdateAddress(ctx, user, id, addressID)
}
func (s Service) Cancel(ctx context.Context, user, id string) error {
	if !validation.UUID(id) {
		return fmt.Errorf("%w: UUID inválido", ErrValidation)
	}
	return s.Store.Cancel(ctx, user, id)
}
func ValidateAddress(a models.Address) error { return a.Validate() }
func (s Service) Create(ctx context.Context, user string, in models.CreateOrder) (models.Order, error) {
	if !validation.UUID(in.AddressID) {
		return models.Order{}, fmt.Errorf("%w: escolha um endereço cadastrado", ErrValidation)
	}
	if !validation.UUID(in.CreditCardID) {
		return models.Order{}, fmt.Errorf("%w: escolha um cartão cadastrado", ErrValidation)
	}
	if len(in.Items) < 1 || len(in.Items) > 50 {
		return models.Order{}, fmt.Errorf("%w: informe de 1 a 50 itens", ErrValidation)
	}
	in.CouponCode = strings.ToUpper(strings.TrimSpace(in.CouponCode))
	if in.CouponCode != "" && in.CouponCode != "GREEN10" {
		return models.Order{}, fmt.Errorf("%w: cupom inválido", ErrValidation)
	}
	seen := map[string]bool{}
	units := 0
	in.Items = append([]models.OrderItemInput(nil), in.Items...)
	for i := range in.Items {
		item := &in.Items[i]
		item.ProductID = strings.ToLower(item.ProductID)
		if !validation.UUID(item.ProductID) || item.Quantity < 1 || item.Quantity > 100 || len(item.Options) > 4 {
			return models.Order{}, fmt.Errorf("%w: item inválido", ErrValidation)
		}
		for key, value := range item.Options {
			if !validation.OptionKey(key) || utf8.RuneCountInString(value) > 40 || value == "" || !validation.PlainText(value) {
				return models.Order{}, fmt.Errorf("%w: opção inválida", ErrValidation)
			}
		}
		if item.Options == nil {
			item.Options = map[string]string{}
		}
		// json.Marshal ordena chaves do map: variações iguais não escapam pela ordem das chaves.
		raw, _ := json.Marshal(item.Options)
		key := item.ProductID + string(raw)
		units += item.Quantity
		if seen[key] || units > 100 {
			return models.Order{}, fmt.Errorf("%w: itens duplicados ou mais de 100 unidades", ErrValidation)
		}
		seen[key] = true
	}
	return s.Store.Create(ctx, user, in)
}
