package validation

import (
	"strings"
	"testing"
)

func TestNewPasswordCountsUnicodeCharacters(t *testing.T) {
	for _, password := range []string{strings.Repeat("á", 6), strings.Repeat("😀", 6), strings.Repeat("a", 11)} {
		if err := NewPassword(password); err == nil || !strings.Contains(err.Error(), "12 caracteres") {
			t.Fatal("short character count accepted", err)
		}
	}
	for _, password := range []string{strings.Repeat("á", 12), strings.Repeat("😀", 12), strings.Repeat("a", 72)} {
		if err := NewPassword(password); err != nil {
			t.Fatal("valid password rejected", err)
		}
	}
	err := NewPassword(strings.Repeat("😀", 19))
	if err == nil || strings.Contains(err.Error(), "bytes") {
		t.Fatal("oversized password error", err)
	}
	if !PasswordCandidate(strings.Repeat("á", 6)) || PasswordCandidate("") {
		t.Fatal("legacy candidate validation")
	}
}
