package orders

import (
	"context"
	"errors"
	"strings"
	"testing"

	"ecommerce-api-go/internal/models"
)

func TestInvalidOrdersNeverReachStore(t *testing.T) {
	id := "00000000-0000-0000-0000-000000000001"
	for _, items := range [][]models.OrderItemInput{nil, {{ProductID: "' OR 1=1", Quantity: 1}}, {{ProductID: id, Quantity: -1}}, {{ProductID: id, Quantity: 101}}, {{ProductID: id, Quantity: 1}, {ProductID: id, Quantity: 1}}, {{ProductID: id, Quantity: 1}, {ProductID: "00000000-0000-0000-0000-000000000001", Quantity: 2}}} {
		// Store nil torna qualquer acesso indevido um panic e uma falha do teste.
		_, err := (Service{}).Create(context.Background(), "owner", models.CreateOrder{Items: items, AddressID: id, CreditCardID: id})
		if !errors.Is(err, ErrValidation) {
			t.Fatalf("expected validation error: %v", err)
		}
	}
	if ValidateAddress(models.Address{}) == nil {
		t.Fatal("empty address accepted")
	}
}

func TestCartCapsCannotBeBypassedByCallingAPI(t *testing.T) {
	id := "00000000-0000-0000-0000-000000000001"
	valid := models.OrderItemInput{ProductID: id, Quantity: 1}
	cases := []models.CreateOrder{
		{AddressID: id, Items: []models.OrderItemInput{valid}},
		{AddressID: id, CreditCardID: id, Items: make([]models.OrderItemInput, 1000)},
		{AddressID: id, CreditCardID: id, Items: []models.OrderItemInput{{ProductID: id, Quantity: 51, Options: map[string]string{"tipo": "A"}}, {ProductID: id, Quantity: 50, Options: map[string]string{"tipo": "B"}}}},
		{AddressID: id, CreditCardID: id, Items: []models.OrderItemInput{{ProductID: id, Quantity: 1, Options: map[string]string{"tipo": strings.Repeat("x", 41)}}}},
		{AddressID: id, CreditCardID: id, Items: []models.OrderItemInput{{ProductID: id, Quantity: 1, Options: map[string]string{"tipo": "bad\x00text"}}}},
		{AddressID: id, CreditCardID: id, CouponCode: "PRICE0", Items: []models.OrderItemInput{valid}},
		{AddressID: "", Items: []models.OrderItemInput{valid}},
	}
	for _, in := range cases {
		if _, err := (Service{}).Create(context.Background(), "owner", in); !errors.Is(err, ErrValidation) {
			t.Fatalf("unsafe input reached store: %v", err)
		}
	}
}
