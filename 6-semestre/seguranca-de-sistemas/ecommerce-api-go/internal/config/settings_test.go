package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLimitsAndEnvPrecedence(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://test")
	for _, name := range []string{"HTTP_MAX_INFLIGHT", "HTTP_MAX_CONNECTIONS", "HTTP_CONNECTIONS_PER_IP", "DB_MAX_CONNECTIONS", "HTTP_RATE_PER_MINUTE", "TLS_CERT_FILE", "TLS_KEY_FILE"} {
		t.Setenv(name, "")
	}
	c, err := Read()
	if err != nil || c.DBConnections != 4 || c.Inflight != 16 || c.Connections != 128 {
		t.Fatalf("defaults: %+v %v", c, err)
	}
	t.Setenv("HTTP_MAX_CONNECTIONS", "0")
	if _, err = Read(); err == nil {
		t.Fatal("invalid bounds accepted")
	}
	t.Setenv("HTTP_MAX_CONNECTIONS", "")
	t.Setenv("TLS_CERT_FILE", "cert.pem")
	if _, err = Read(); err == nil {
		t.Fatal("unpaired TLS configuration accepted")
	}
	file := filepath.Join(t.TempDir(), ".env")
	if err = os.WriteFile(file, []byte("DATABASE_URL=do-not-overwrite\r\n# UTF-8 e CRLF são aceitos\r\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if err = LoadEnv(file); err != nil {
		t.Fatal(err)
	}
	if os.Getenv("DATABASE_URL") != "postgres://test" {
		t.Fatal("system environment overwritten")
	}
	t.Setenv("CONFIG_TEST_DSN", "")
	_ = os.Unsetenv("CONFIG_TEST_DSN")
	if err = os.WriteFile(file, []byte("CONFIG_TEST_DSN=host=127.0.0.1 password='senha com espaço'\n"), 0600); err != nil {
		t.Fatal(err)
	}
	if err = LoadEnv(file); err != nil {
		t.Fatal(err)
	}
	if os.Getenv("CONFIG_TEST_DSN") != "host=127.0.0.1 password='senha com espaço'" {
		t.Fatal("DSN quote removed")
	}
}
