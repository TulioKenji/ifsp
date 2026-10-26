package validation

import "strings"

// Normalização permite somente pontuação esperada, nunca remove letras silenciosamente.
func Digits(s, punctuation string) (string, bool) {
	if len(s) > 32 {
		return "", false
	}
	var b strings.Builder
	for _, c := range s {
		if c >= '0' && c <= '9' {
			b.WriteRune(c)
		} else if !strings.ContainsRune(punctuation, c) {
			return "", false
		}
	}
	return b.String(), true
}
func CPF(raw string) (string, bool) {
	s, ok := Digits(raw, ".- ")
	if !ok || len(s) != 11 || s == strings.Repeat(s[:1], 11) {
		return "", false
	}
	for end := 9; end <= 10; end++ {
		sum := 0
		for i := 0; i < end; i++ {
			sum += int(s[i]-'0') * (end + 1 - i)
		}
		digit := (sum * 10) % 11
		if digit == 10 {
			digit = 0
		}
		if digit != int(s[end]-'0') {
			return "", false
		}
	}
	return s, true
}
func Phone(raw string) (string, bool) {
	// Contrato brasileiro: DDD + 10/11 dígitos locais, com +55 opcional.
	if strings.Count(raw, "+") > 1 || (strings.Contains(raw, "+") && !strings.HasPrefix(strings.TrimSpace(raw), "+")) {
		return "", false
	}
	s, ok := Digits(raw, "+()- ")
	if !ok {
		return "", false
	}
	if strings.HasPrefix(strings.TrimSpace(raw), "+") {
		if !strings.HasPrefix(strings.TrimSpace(raw), "+55") {
			return "", false
		}
		s = strings.TrimPrefix(s, "55")
	}
	if (len(s) != 10 && len(s) != 11) || s[0] == '0' || s[1] == '0' {
		return "", false
	}
	if len(s) == 11 && s[2] != '9' {
		return "", false
	}
	if len(s) == 10 && (s[2] < '2' || s[2] > '5') {
		return "", false
	}
	return "+55" + s, true
}
func PAN(raw string) (string, string, bool) {
	s, ok := Digits(raw, " -")
	if !ok || len(s) < 13 || len(s) > 19 || s == strings.Repeat(s[:1], len(s)) {
		return "", "", false
	}
	sum := 0
	for i := len(s) - 1; i >= 0; i-- {
		n := int(s[i] - '0')
		if (len(s)-1-i)%2 == 1 {
			n *= 2
			if n > 9 {
				n -= 9
			}
		}
		sum += n
	}
	if sum%10 != 0 {
		return "", "", false
	}
	brand := ""
	switch {
	case s[0] == '4' && (len(s) == 13 || len(s) == 16 || len(s) == 19):
		brand = "Visa"
	case len(s) == 16 && ((s[:2] >= "51" && s[:2] <= "55") || (s[:4] >= "2221" && s[:4] <= "2720")):
		brand = "Mastercard"
	case len(s) == 15 && (s[:2] == "34" || s[:2] == "37"):
		brand = "Amex"
	}
	return s, brand, brand != ""
}
