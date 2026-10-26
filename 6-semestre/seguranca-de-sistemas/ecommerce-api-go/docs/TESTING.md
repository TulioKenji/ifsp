# Testes de instalação, segurança e carga

Use sempre um PostgreSQL descartável para integração e um alvo próprio/autorizado para carga. Não é preciso Docker: uma instância local do PostgreSQL ou um banco de laboratório isolado é suficiente. `TEST_DATABASE_URL` nunca é inferida do `.env` de produção.

## Reproduzir

```sh
# Na máquina de desenvolvimento, com Go 1.27.3+ e um PostgreSQL de testes.
export TEST_DATABASE_URL='host=127.0.0.1 port=55432 user=postgres dbname=postgres sslmode=disable'
sh scripts/verify.sh
go test ./internal/queryparams -fuzz FuzzParse -fuzztime 5s -parallel 2
VULN_SCAN=1 sh scripts/verify.sh
# Opcional, se houver gcc/clang no ambiente de testes:
RACE=1 sh scripts/verify.sh
```

Sem TEST_DATABASE_URL, integração é ignorada. O teste de bootstrap cria/remove uma base exclusiva e requer CREATEDB. Os outros testes criam/removem schemas exclusivos e não usam dados da aplicação. O detector de corrida exige CGO/compilador C só para testar; o binário distribuído continua CGO=0.

Para preparar seu banco real, use `go run ./cmd/dbsetup` (ou `sh scripts/setup-db.sh`). Para somente diagnóstico, `go run ./cmd/dbsetup --check`. Não confunda esses comandos com os testes descartáveis.

## Carga no servidor iniciado separadamente

```sh
# Tráfego normal: 20 consultas em aproximadamente dez segundos.
go run ./cmd/stress --url http://127.0.0.1:8080/api/products \
  --requests 20 --concurrency 2 --rps 2 --duration 20s

# Abuso controlado: no máximo 2000 GETs e 16 workers, prazo de 30s.
go run ./cmd/stress --url http://127.0.0.1:8080/api/products \
  --requests 2000 --concurrency 16 --duration 30s
```

`stress` também é distribuído como binário: no Ubuntu substitua `go run ./cmd/stress` por `/opt/greenstore/stress`. HTTPS usa validação normal do certificado. A ferramenta só permite loopback por padrão, não segue redirects e nunca faz POST/compras. Para o computador da faculdade, use a URL exata e `--allow-remote` apenas se autorizado. Limites rígidos: 20000 requests, 64 workers, 500 req/s e 60 segundos. Prazo excedido, erro de rede ou HTTP inesperado causa saída não zero.

O JSON mostra contagem por status e latências de todas as respostas. `429` é rate limit e `503` é recusa de sobrecarga: não são consultas processadas. Nunca use a taxa de respostas rejeitadas como capacidade comercial do aplicativo.

Para medir capacidade SQL, em uma instância **isolada de teste**, ajuste temporariamente `HTTP_RATE_PER_MINUTE=10000`, mantendo os demais limites. Reinicie essa instância e rode:

```sh
go run ./cmd/stress --requests 2000 --concurrency 16 --duration 30s
go run ./cmd/stress --requests 2000 --concurrency 32 --duration 30s
go run ./cmd/stress --requests 4000 --concurrency 16 --rps 200 --duration 30s
```

Não transfira esse ajuste de taxa para o servidor público sem medição e justificativa. Com a configuração padrão, um cliente tem 180 requests/minuto, incluindo assets e preflights; depois de exceder a cota ele recebe 429 até a janela renovar. Computadores atrás do mesmo NAT/proxy podem compartilhar o limite.

## O que é verificado

| Vetor | Evidência automatizada |
| --- | --- |
| Banco inexistente/schema vazio | Criação da base, instalação, migrations, 109 produtos e imagens |
| Reexecução do setup | Zero duplicações e nenhuma redefinição de preço/estoque; reparo da tabela de imagens antiga |
| SQL injection | Busca com aspas, OR, ponto-e-vírgula e pg_sleep tratada como texto; campo/UUID malicioso rejeitado; catálogo permanece íntegro |
| XSS | Busca/script e nome com script não executados pelo backend; JSON escapa HTML, nosniff/CSP presentes; React renderiza texto |
| IDOR/estado do pedido | Outro cliente não lê/edita/cancela; última unidade/cancelamento concorrentes não duplicam estoque |
| Endereços/opções/cupom | Endereço alheio/arquivado rejeitado, FK composta, snapshots, quota concorrente de 20 ativos, rollback de opções inválidas, GREEN10 limitado a R$ 50 |
| Migration de pedidos antigos | Backfill de endereço arquivado preserva entrega e dono do pedido |
| Dados sensíveis e chaves | Nonce diferente, AAD/dono/campo, tamper, dado criptografado no PostgreSQL, canário recusa chave trocada/ausente |
| Cartões e perfil | Senha atual, CSRF, quotas concorrentes, duplicidade, cartão alheio/expirado/arquivado, snapshots, CVV desconhecido e máscaras sem PAN |
| Transporte dos dados novos | HTTP remoto/produção recusado, HTTPS e desenvolvimento loopback aceitos; X-Forwarded-Proto não contorna |
| Carrinho e forms na View | npm test: 1000 itens, JSON/tamanho/versão adulterados, 50 linhas/100 unidades, prototype pollution e erros em caminhos de arrays |
| Mass assignment | Campos user_id, total e status são rejeitados |
| Sessão/CSRF/força bruta | Logout, revogação, expiração, conta bloqueada, teto de sessões, lockout por conta e CSRF |
| Origem/headers falsos | CORS público sem cookies, origens de escrita restritas; X-Forwarded-For não contorna cota |
| Inputs malformados | NUL, UTF-8 inválido, quantidade/paginação excessivas e corpo grande não viram SQL/500 |
| HTTP lento/sockets | Headers parciais fechados em 3s; limite de sockets por IP e liberação após fechamento |
| Framing/headers | Content-Length conflitante, Transfer-Encoding chunked recusado e header de 64 KiB rejeitado |
| TLS | HTTPS válido no teste, HSTS e rejeição de TLS anterior a 1.2 |
| Flood e recuperação | 1000 GETs com quota curta, rejeição por taxa e request saudável após renovação |
| Dependências | govulncheck analisa alcançabilidade com a base oficial Go |
| Portabilidade | Build Linux amd64/arm64 sem CGO; scripts com LF e sintaxe shell verificada |

Esses testes reproduzem vetores comuns de ferramentas como scanners HTTP, força bruta e injeção. As ferramentas reais de Kali, captura de rede, SYN flood, saturação de link, ataque distribuído e a execução no Ubuntu da faculdade não foram testados aqui. “Kali” é o sistema de origem, não uma classe única de ataque. São necessários testes autorizados no destino e proteção da rede; veja [SECURITY.md](SECURITY.md) e [Ubuntu](../deploy/ubuntu.md).

O relatório de medições desta implementação está em [TEST-RESULTS.md](TEST-RESULTS.md).
