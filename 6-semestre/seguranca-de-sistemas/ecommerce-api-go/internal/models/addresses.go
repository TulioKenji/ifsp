package models

import (
	"ecommerce-api-go/internal/validation"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"
)

type SavedAddress struct {
	Address
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (a Address) Validate() error {
	for _, f := range []struct {
		value string
		max   int
	}{{a.RecipientName, 150}, {a.PostalCode, 20}, {a.Street, 200}, {a.Number, 20}, {a.Neighborhood, 100}, {a.City, 100}, {a.State, 100}, {a.Country, 100}} {
		if !validation.PlainText(f.value) || strings.TrimSpace(f.value) == "" || utf8.RuneCountInString(f.value) > f.max {
			return fmt.Errorf("%w: endereço incompleto ou campo inválido", validation.ErrInput)
		}
	}
	if !validation.PlainText(a.Complement) || utf8.RuneCountInString(a.Complement) > 100 {
		return fmt.Errorf("%w: complemento inválido", validation.ErrInput)
	}
	return nil
}
