package models

import "time"

// Valores monetários saem como strings decimais: float64 não representa centavos exatamente.
type Address struct {
	RecipientName string `json:"recipient_name"`
	PostalCode    string `json:"postal_code"`
	Street        string `json:"street"`
	Number        string `json:"number"`
	Complement    string `json:"complement"`
	Neighborhood  string `json:"neighborhood"`
	City          string `json:"city"`
	State         string `json:"state"`
	Country       string `json:"country"`
}

type OrderItemInput struct {
	ProductID string            `json:"product_id"`
	Quantity  int               `json:"quantity"`
	Options   map[string]string `json:"options"`
}

type CreateOrder struct {
	CreditCardID string           `json:"credit_card_id"`
	Items        []OrderItemInput `json:"items"`
	AddressID    string           `json:"address_id"`
	CouponCode   string           `json:"coupon_code,omitempty"`
}

type OrderItem struct {
	Options     map[string]string `json:"options"`
	ID          string            `json:"id"`
	ProductID   *string           `json:"product_id"`
	ProductName string            `json:"product_name"`
	SKU         *string           `json:"sku"`
	Quantity    int               `json:"quantity"`
	UnitPrice   string            `json:"unit_price"`
	TotalPrice  string            `json:"total_price"`
}

type Order struct {
	CreditCardID    *string     `json:"credit_card_id"`
	CardBrand       string      `json:"card_brand"`
	CardLast4       string      `json:"card_last4"`
	AddressID       string      `json:"address_id"`
	CouponCode      string      `json:"coupon_code"`
	ID              string      `json:"id"`
	Status          string      `json:"status"`
	Subtotal        string      `json:"subtotal"`
	ShippingCost    string      `json:"shipping_cost"`
	Discount        string      `json:"discount"`
	Total           string      `json:"total"`
	Currency        string      `json:"currency"`
	ShippingAddress Address     `json:"shipping_address"`
	Items           []OrderItem `json:"items"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}
