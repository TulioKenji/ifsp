package validation

import "testing"

func TestPersonalDataValidation(t *testing.T) {
	if cpf, ok := CPF("529.982.247-25"); !ok || cpf != "52998224725" {
		t.Fatal("valid CPF rejected")
	}
	for _, s := range []string{"", "11111111111", "00000000000", "52998224724", "529a98224725", "' OR 1=1"} {
		if _, ok := CPF(s); ok {
			t.Fatal("invalid CPF accepted")
		}
	}
	for _, s := range []string{"(11) 99999-9999", "+55 (11) 99999-9999", "1133334444"} {
		if _, ok := Phone(s); !ok {
			t.Fatal("valid phone rejected")
		}
	}
	for _, s := range []string{"", "0000000000", "+1 2125551234", "11abcdefghi", "11123456789"} {
		if _, ok := Phone(s); ok {
			t.Fatal("invalid phone accepted")
		}
	}
	for raw, want := range map[string]string{"4242 4242 4242 4242": "Visa", "5555555555554444": "Mastercard", "378282246310005": "Amex"} {
		if _, brand, ok := PAN(raw); !ok || brand != want {
			t.Fatal("valid PAN rejected")
		}
	}
	for _, s := range []string{"", "0000000000000000", "4242424242424241", "4242a424242424242"} {
		if _, _, ok := PAN(s); ok {
			t.Fatal("invalid PAN accepted")
		}
	}
}
