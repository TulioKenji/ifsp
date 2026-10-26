package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Settings struct {
	DataKeyFile                                                           string
	DatabaseURL, Addr, SPA, TLSCert, TLSKey                               string
	Origins                                                               []string
	DBConnections, Inflight, Connections, ConnectionsPerIP, RatePerMinute int
}

// Defaults conservadores para um único computador. Erro de configuração impede startup.
func Read() (Settings, error) {
	c := Settings{DatabaseURL: os.Getenv("DATABASE_URL"), Addr: os.Getenv("HTTP_ADDR"), SPA: os.Getenv("SPA_DIR"),
		TLSCert: os.Getenv("TLS_CERT_FILE"), TLSKey: os.Getenv("TLS_KEY_FILE"), Origins: strings.Split(os.Getenv("CORS_ALLOWED_ORIGINS"), ",")}
	c.DataKeyFile = os.Getenv("DATA_KEY_FILE")
	if c.DataKeyFile == "" {
		c.DataKeyFile = ".secrets/data.key"
	}
	if c.DatabaseURL == "" {
		return c, fmt.Errorf("DATABASE_URL ausente")
	}
	if c.Addr == "" {
		c.Addr = ":8080"
	}
	if c.SPA == "" {
		c.SPA = "../ecommerce-front-spa/dist"
	}
	if (c.TLSCert == "") != (c.TLSKey == "") {
		return c, fmt.Errorf("configure TLS_CERT_FILE e TLS_KEY_FILE juntos")
	}
	for _, f := range []struct {
		name          string
		target        *int
		def, min, max int
	}{
		{"DB_MAX_CONNECTIONS", &c.DBConnections, 4, 1, 32}, {"HTTP_MAX_INFLIGHT", &c.Inflight, 16, 1, 128},
		{"HTTP_MAX_CONNECTIONS", &c.Connections, 128, 1, 1024}, {"HTTP_CONNECTIONS_PER_IP", &c.ConnectionsPerIP, 32, 1, 256},
		{"HTTP_RATE_PER_MINUTE", &c.RatePerMinute, 180, 1, 10000},
	} {
		value := f.def
		if raw := os.Getenv(f.name); raw != "" {
			n, err := strconv.Atoi(raw)
			if err != nil {
				return c, fmt.Errorf("%s deve ser inteiro", f.name)
			}
			value = n
		}
		if value < f.min || value > f.max {
			return c, fmt.Errorf("%s deve ser %d..%d", f.name, f.min, f.max)
		}
		*f.target = value
	}
	if c.ConnectionsPerIP > c.Connections {
		return c, fmt.Errorf("HTTP_CONNECTIONS_PER_IP não pode exceder HTTP_MAX_CONNECTIONS")
	}
	return c, nil
}
