package secrets

import (
	"bytes"
	"encoding/base64"
	"os"
	"path/filepath"
	"testing"
)

func TestAuthenticatedEncryptionBoundToOwnerAndField(t *testing.T) {
	v, err := New(bytes.Repeat([]byte{7}, 32))
	if err != nil {
		t.Fatal(err)
	}
	plain := "4242424242424242"
	one := v.Seal(plain, "card:owner:number")
	two := v.Seal(plain, "card:owner:number")
	if bytes.Equal(one, two) || bytes.Contains(one, []byte(plain)) {
		t.Fatal("nonce reused or plaintext leaked")
	}
	if got, err := v.Open(one, "card:owner:number"); err != nil || got != plain {
		t.Fatal(err)
	}
	for _, aad := range []string{"card:other:number", "card:owner:holder"} {
		if _, err := v.Open(one, aad); err == nil {
			t.Fatal("AAD ignored")
		}
	}
	one[len(one)-1] ^= 1
	if _, err := v.Open(one, "card:owner:number"); err == nil {
		t.Fatal("tamper accepted")
	}
	if v.Fingerprint("a", plain) == v.Fingerprint("b", plain) {
		t.Fatal("fingerprints link users")
	}
	if _, err := New([]byte("short")); err == nil {
		t.Fatal("weak key accepted")
	}
}
func TestKeyFileMustExistAndBeValid(t *testing.T) {
	path := filepath.Join(t.TempDir(), "key")
	if _, err := Load(path); err == nil {
		t.Fatal("missing key accepted")
	}
	if err := os.WriteFile(path, []byte("bad"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := Load(path); err == nil {
		t.Fatal("bad key accepted")
	}
	if err := os.WriteFile(path, []byte(base64.StdEncoding.EncodeToString(bytes.Repeat([]byte{1}, 32))), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := Load(path); err != nil {
		t.Fatal(err)
	}
}
