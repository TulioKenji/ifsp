package models

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestSecretsNeverSerialize(t *testing.T) {
	for _, value := range []any{User{PasswordHash: "sensitive-hash"}, Session{TokenHash: "sensitive-hash"}} {
		out, err := json.Marshal(value)
		if err != nil || strings.Contains(string(out), "sensitive-hash") || strings.Contains(string(out), "Hash") {
			t.Fatalf("secret exposed in JSON: %s %v", out, err)
		}
	}
}
