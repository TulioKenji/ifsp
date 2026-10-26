# Resultados — 22/10/2026

Ambiente efetivamente executado: Windows/amd64, Go 1.27.3, PostgreSQL 18 local descartável na porta 55432, sem Docker. PostgreSQL de teste com shared_buffers=32 MB e max_connections=24. Dataset: 109 produtos/109 imagens. Aplicativo com 4 conexões de banco, 16 requests simultâneos, até 128 sockets/32 por IP e GOMEMLIMIT=96MiB. Cliente e servidor estavam no mesmo computador; estes números não predizem o desempenho do PC da faculdade.

## Catálogo e instalação

A causa observada no banco local configurado foi `relação "products" não existe` (42P01). Foi executado o novo dbsetup nesse banco: schema e migrations criados, 109 produtos e 109 imagens inseridos. O diagnóstico posterior retornou catálogo total 109 e busca `ssd` com 3 resultados. Nenhum produto existente foi sobrescrito. O teste de base inteiramente ausente também passou numa base descartável.

## Carga HTTP real

| Perfil | Requests / concorrência | HTTP | Tempo | p95 | Erros de rede |
| --- | --- | --- | --- | --- | --- |
| Padrão, 2 req/s | 20 / 2 | 20 × 200 | 10,00s | 2,31 ms | 0 |
| Padrão, rajada após baseline | 2000 / 16 | 160 × 200; 1840 × 429 | 0,16s | 6,76 ms (respostas mistas) | 0 |
| Capacidade isolada, taxa 10000/min | 2000 / 16 | 2000 × 200 | 1,04s | 19,55 ms | 0 |
| Sobrecarga isolada, taxa 10000/min | 2000 / 32 | 70 × 200; 1930 × 503 | 0,08s | 2,52 ms (respostas mistas) | 0 |
| Sustentado isolado, 200 req/s | 4000 / 16 | 4000 × 200 | 20,00s | 2,26 ms | 0 |

Não houve HTTP 500 nesses testes. A quota padrão aceitou 180 requests ao todo (20 do baseline + 160 da rajada), depois recusou o excedente. O limite de concorrência recusou trabalho sem fila ilimitada. O teste unitário de flood confirmou atendimento normal após renovar a janela de rate limit.

Pico de memória residente do processo (PeakWorkingSet64): 20115456 bytes (~19,2 MiB) no perfil padrão; 21991424 bytes (~21,0 MiB) no conjunto de capacidade/sustentado. Esse valor é do processo Go no Windows, não inclui PostgreSQL, cliente, cache de arquivos ou sistema operacional. Não houve medição de RSS no Linux nem ensaio de longa duração.

## Outras verificações

- `go test ./... -count=1` com TEST_DATABASE_URL: passou, incluindo instalação, SQL real, segurança, TLS, sockets, timeout e concorrência.
- `go vet ./...`: passou.
- FuzzParse por 5s com 2 workers: 353356 execuções, sem falhas.
- govulncheck v1.9.0 após atualizar dependências/toolchain: zero vulnerabilidades alcançáveis e zero em pacotes importados. Um aviso permanece no módulo x/crypto: [GO-2026-5932](https://pkg.go.dev/vuln/GO-2026-5932), sobre OpenPGP, sem versão corrigida. O projeto não importa esses pacotes; usa bcrypt. Não foi ocultado ou excluído o aviso da análise.
- Build Linux amd64/arm64 com CGO_ENABLED=0: gerado. Isso valida compilação, não execução em kernel Linux.
- Scripts shell: sintaxe verificada em Bash; arquivos de shell/Go/SQL configurados para LF no Git.

Não havia Linux/WSL/Kali disponível. Não foi executado o detector de corrida (`-race`) porque o ambiente não tinha compilador C/CGO. O guia fornece esse comando para um ambiente de testes Linux. A unidade systemd e os grants de produção são modelos para validação no destino, não configurações aplicadas ao computador da faculdade.

Antes de publicar ou antes da avaliação, repita as medições e o scanner: novas vulnerabilidades e características do ambiente podem mudar o resultado. Defesas por aplicação não impedem um atacante de saturar o link ou consumir recursos do kernel antes de chegar ao Go.

## Incremento da View e endereços — 23/10/2026

Mesmo ambiente Windows/amd64 e PostgreSQL 18 descartável, sem Docker. O banco configurado da aplicação não foi alterado neste incremento; a atualização do ambiente existente exige `go run ./cmd/dbsetup` antes de iniciar o servidor atualizado.

- `npm test`: 14 testes passaram, incluindo storage bloqueado, JSON/versão adulterados, payload maior que 16 KiB, 1000 linhas, total acima de 100 unidades, limite de 50 linhas, edição e prototype pollution. Testes de formulário verificam escrita imutável, arrays, limites de caminhos, mensagens por campo e texto HTML tratado como texto.
- `npm run lint` e `npm run build`: passaram; chunks por página preservados.
- `go test ./... -count=1` com TEST_DATABASE_URL: passou. Novos cenários incluem endereço alheio/arquivado, FK composta de dono, quota de 20 endereços sob 26 cadastros concorrentes, opções inválidas sem mudar estoque/persistir pedido, duas variações do mesmo produto, GREEN10 com teto de R$ 50, snapshot e devolução de estoque.
- Bootstrap: quatro migrations e 109 produtos/imagens, reexecução idempotente, consulta em lote de produtos e backfill de pedido legado preservando a entrega em endereço histórico arquivado.
- `go vet ./...`: passou. `CGO_ENABLED=0 GOOS=linux GOARCH=amd64/arm64 go build ./...`: passou nas duas arquiteturas; não foi executado em Linux.
- govulncheck v1.9.0: novamente zero vulnerabilidades alcançáveis e zero em pacotes importados; um aviso em módulo requerido continua sem chamada pelo código (OpenPGP registrado acima).

Não havia navegador conectado para inspeção visual ou teste dos gestos/animações. O roteiro manual está em [UI-FLOWS.md](../../ecommerce-front-spa/docs/UI-FLOWS.md). As cargas HTTP da seção anterior não foram repetidas neste incremento; os testes de abuso/recuperação do servidor foram executados na suíte Go. Não se declara teste real de Kali/Ubuntu nem resistência garantida a DDoS.

## Perfil sensível e cartões — 25/10/2026

Ambiente executado: Windows/amd64, Go 1.27.3, PostgreSQL 18 descartável em localhost:55432 (32 MB de shared_buffers e 24 conexões), sem Docker. O banco configurado do projeto não foi alterado e nenhuma chave de dados real foi criada ou substituída.

- `go test ./... -count=1` com TEST_DATABASE_URL e `go vet ./...`: passaram. A suíte inclui todas as regressões anteriores de estoque, sessões, CSRF, limites, HTTP e bootstrap.
- Novos testes: CPF/telefone/Luhn/validade; senha antes de persistência; AES-GCM com nonces diferentes, AAD por dono/campo e recusa de tamper; dados sensíveis criptografados no banco e respostas mascaradas; cartão alheio/expirado/arquivado; FK composta; snapshots e cancelamento após excluir cartão; quota concorrente de 10 cartões e duplicidade.
- Migração 005: preserva pedido legado sem fabricar cartão e impede nova inserção sem vínculo obrigatório. Bootstrap continua idempotente com cinco migrations.
- Canário: startup idempotente com chave correta, recusa de chave trocada e de canário ausente sobre dados existentes. Runtime com os grants documentados salvou perfil/cartão, confirmou canário e arquivou cartão, sem poder alterar canário ou executar DDL.
- Transporte: HTTP remoto e HTTP em produção recusados; HTTPS e desenvolvimento loopback aceitos. X-Forwarded-Proto falso não contorna a política. Fluxo HTTP com PostgreSQL verifica senha incorreta, CSRF e recusa de CVV.
- `npm test`: 19 testes passaram; `npm run lint` e `npm run build`: passaram. Os casos novos verificam schemas, validação, cartão obrigatório e recusa de dados sensíveis no carrinho persistido. Chunks por página preservados.
- `CGO_ENABLED=0 GOOS=linux GOARCH=amd64/arm64 go build ./...`: passou em ambas as arquiteturas. Sintaxe do script de build verificada em Bash; keygen incluído no pacote nativo.
- `cmd/keygen`: criação verificada com chave descartável; segunda execução recusou sobrescrita e o conteúdo permaneceu igual. O arquivo de teste foi removido.
- govulncheck v1.9.0 no código final: zero vulnerabilidades alcançáveis e zero em pacotes importados; permanece um aviso em módulo requerido não chamado (OpenPGP registrado acima).

Não havia navegador conectado para inspeção visual. Não houve execução em Ubuntu/Kali, cobrança real, auditoria PCI nem teste externo de rede. Cargas HTTP históricas não foram repetidas; os testes de abuso do servidor foram executados na suíte. Gestão de vendedor/remessas, gateway, idempotência, retenção e rotação offline de chaves continuam descritos como pontos de evolução em [SENSITIVE-DATA.md](SENSITIVE-DATA.md).

## Detalhe do produto, máscaras e senhas — 26/10/2026

- `npm test`: 29 testes passaram, incluindo máscaras de CPF/CEP/telefone/cartão, Amex/19 dígitos, entradas grandes, edição/cursor/Backspace/Delete, contrato de detalhe de produto, UUID adulterado/404 e busca validada por URL.
- Senhas: testes frontend/Go verificam mínimo de 12 caracteres Unicode, recusa de excesso sem mensagem em bytes e manutenção do login/confirmação legados. PostgreSQL confirmou cadastro/login com 12 caracteres acentuados e acesso a conta antiga com 6 caracteres/12 bytes.
- `npm run lint`, `npm run build`, `go test ./... -count=1` com PostgreSQL descartável e `go vet ./...`: passaram. O build inclui product-detail em chunk separado. Não foi necessária migration nova, troca de chave ou atualização de dependências.
- govulncheck v1.9.0: zero vulnerabilidades alcançáveis/importadas; permanece o aviso no módulo não chamado registrado anteriormente.

Ambiente Windows/amd64 e PostgreSQL 18 descartável em localhost:55432. Banco configurado e chaves existentes preservados. Não havia navegador conectado: cliques, foco, layout responsivo e comportamento visual das máscaras/modais não foram inspecionados em navegador real. Testes automatizados dos helpers não equivalem a essa inspeção. Não foram repetidas cargas externas nem execução em Ubuntu/Kali.
