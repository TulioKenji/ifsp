package validation

import (
	"fmt"
	"unicode/utf8"
)

// Senhas novas contam caracteres Unicode. A capacidade do bcrypt continua sendo
// validada sem truncar a senha; o erro público usa linguagem de caracteres.
func PasswordCandidate(s string) bool { return utf8.ValidString(s) && len(s) > 0 && len(s) <= 72 }
func NewPassword(s string) error {
	if !utf8.ValidString(s) || utf8.RuneCountInString(s) < 12 {
		return fmt.Errorf("%w: use uma senha com pelo menos 12 caracteres", ErrInput)
	}
	if len(s) > 72 {
		return fmt.Errorf("%w: senha muito longa; reduza a quantidade de caracteres", ErrInput)
	}
	return nil
}
