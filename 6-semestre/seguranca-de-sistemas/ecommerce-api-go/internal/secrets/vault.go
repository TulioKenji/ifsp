// Package secrets protege dados em repouso; HTTP nunca devolve o texto completo.
package secrets

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hkdf"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"os"
	"strings"
)

type Vault struct {
	aead     cipher.AEAD
	indexKey []byte
}

func New(key []byte) (*Vault, error) {
	if len(key) != 32 {
		return nil, errors.New("chave de dados deve ter 32 bytes")
	}
	// HKDF deriva chaves distintas para cifrar e indexar, com contextos explícitos.
	encryptionKey, err := hkdf.Key(sha256.New, key, nil, "greenstore/encryption/v1", 32)
	if err != nil {
		return nil, err
	}
	indexKey, err := hkdf.Key(sha256.New, key, nil, "greenstore/card-index/v1", 32)
	if err != nil {
		return nil, err
	}
	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCMWithRandomNonce(block)
	if err != nil {
		return nil, err
	}
	return &Vault{aead: aead, indexKey: indexKey}, nil
}
func Load(path string) (*Vault, error) {
	info, err := os.Stat(path)
	if err != nil || !info.Mode().IsRegular() || info.Size() > 128 {
		return nil, errors.New("chave de dados ausente/inválida: execute go run ./cmd/keygen e configure DATA_KEY_FILE")
	}
	if info.Mode().Perm()&0077 != 0 && os.PathSeparator == '/' {
		return nil, errors.New("DATA_KEY_FILE deve ter permissão 0600")
	}
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, errors.New("não foi possível ler DATA_KEY_FILE")
	}
	key, err := base64.StdEncoding.DecodeString(strings.TrimSpace(string(raw)))
	if err != nil {
		return nil, errors.New("DATA_KEY_FILE inválido")
	}
	return New(key)
}
func (v *Vault) Seal(text, purpose string) []byte {
	// GCM gera nonce aleatório em cada gravação. AAD vincula dado, usuário e campo:
	// copiar ciphertext para outro dono/campo falha na autenticação criptográfica.
	return append([]byte{1}, v.aead.Seal(nil, nil, []byte(text), []byte(purpose))...)
}
func (v *Vault) Open(data []byte, purpose string) (string, error) {
	if len(data) < 1 || data[0] != 1 {
		return "", errors.New("versão de cifra inválida")
	}
	plain, err := v.aead.Open(nil, nil, data[1:], []byte(purpose))
	if err != nil {
		return "", errors.New("dado criptografado inválido")
	}
	return string(plain), nil
}
func (v *Vault) Fingerprint(user, pan string) string {
	mac := hmac.New(sha256.New, v.indexKey)
	mac.Write([]byte(user + ":" + pan))
	return hex.EncodeToString(mac.Sum(nil))
}
