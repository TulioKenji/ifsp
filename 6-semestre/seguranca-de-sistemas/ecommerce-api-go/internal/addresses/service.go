package addresses

import (
	"context"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/validation"
	"fmt"
)

type Store interface {
	List(context.Context, string) ([]models.SavedAddress, error)
	Save(context.Context, string, string, models.Address) (models.SavedAddress, error)
	Archive(context.Context, string, string) error
}
type Service struct{ Store Store }

func (s Service) List(ctx context.Context, user string) ([]models.SavedAddress, error) {
	return s.Store.List(ctx, user)
}
func (s Service) Save(ctx context.Context, user, id string, a models.Address) (models.SavedAddress, error) {
	if id != "" && !validation.UUID(id) {
		return models.SavedAddress{}, fmt.Errorf("%w: UUID inválido", validation.ErrInput)
	}
	if err := a.Validate(); err != nil {
		return models.SavedAddress{}, err
	}
	return s.Store.Save(ctx, user, id, a)
}
func (s Service) Archive(ctx context.Context, user, id string) error {
	if !validation.UUID(id) {
		return fmt.Errorf("%w: UUID inválido", validation.ErrInput)
	}
	return s.Store.Archive(ctx, user, id)
}
