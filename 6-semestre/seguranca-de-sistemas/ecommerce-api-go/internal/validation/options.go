package validation

// Chaves tornam-se caminhos no formulário (options.tamanho). Aceitar pontos ou
// nomes especiais poderia confundir o mapa de campos no cliente JavaScript.
func OptionKey(s string) bool {
	if len(s) < 1 || len(s) > 20 || s == "constructor" || s == "prototype" {
		return false
	}
	for i, c := range s {
		if c >= 'a' && c <= 'z' {
			continue
		}
		if i > 0 && (c == '_' || c >= '0' && c <= '9') {
			continue
		}
		return false
	}
	return true
}
