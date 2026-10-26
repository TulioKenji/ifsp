package models

import "time"

type Profile struct {
	Complete    bool   `json:"complete"`
	CPFMasked   string `json:"cpf_masked"`
	PhoneMasked string `json:"phone_masked"`
}
type ProfileInput struct {
	CPF             string `json:"cpf"`
	Phone           string `json:"phone"`
	CurrentPassword string `json:"current_password"`
}
type CardInput struct {
	Number          string `json:"number"`
	HolderName      string `json:"holder_name"`
	ExpMonth        int    `json:"exp_month"`
	ExpYear         int    `json:"exp_year"`
	CurrentPassword string `json:"current_password"`
}
type CreditCard struct {
	ID        string    `json:"id"`
	Brand     string    `json:"brand"`
	Last4     string    `json:"last4"`
	ExpMonth  int       `json:"exp_month"`
	ExpYear   int       `json:"exp_year"`
	CreatedAt time.Time `json:"created_at"`
}

// Persistência recebe ciphertext, nunca structs de request ou campos de senha.
type ProtectedProfile struct {
	CPF, Phone             []byte
	CPFMasked, PhoneMasked string
}
type ProtectedCard struct {
	Number, Holder    []byte
	Fingerprint       string
	Brand, Last4      string
	ExpMonth, ExpYear int
}
