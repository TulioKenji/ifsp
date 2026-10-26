package validation

import (
	"unicode"
	"unicode/utf8"
)

// PostgreSQL TEXT não aceita NUL. Rejeitar controles na fronteira evita 500 para
// texto binário/malformado e mantém endereços, nomes e buscas em uma única linha.
func PlainText(s string) bool {
	if !utf8.ValidString(s) {
		return false
	}
	for _, r := range s {
		if unicode.IsControl(r) {
			return false
		}
	}
	return true
}
