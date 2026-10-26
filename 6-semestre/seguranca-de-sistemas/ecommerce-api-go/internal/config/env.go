package config

import (
	"fmt"
	"os"
	"strings"
)

// LoadEnv lê .env sem executar shell. Variáveis já definidas pelo sistema têm prioridade.
func LoadEnv(path string) error {
	content, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	for _, line := range strings.Split(string(content), "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		key = strings.TrimSpace(key)
		if !ok || key == "" {
			return fmt.Errorf("linha inválida em %s", path)
		}
		if _, exists := os.LookupEnv(key); !exists {
			value = strings.TrimSpace(value)
			if len(value) >= 2 && ((value[0] == '"' && value[len(value)-1] == '"') || (value[0] == '\'' && value[len(value)-1] == '\'')) {
				value = value[1 : len(value)-1]
			}
			if err := os.Setenv(key, value); err != nil {
				return err
			}
		}
	}
	return nil
}
