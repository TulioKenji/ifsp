# Guia para agentes — GreenStore Go

## Contexto

Projeto didático de Segurança de Sistemas. O autor está aprendendo Go: explique em português o motivo das decisões e comente fluxos, transações e recursos da linguagem que não sejam óbvios. A aplicação é um monólito MVC que serve JSON em `/api/*` e o React em `/*`. Não usa JWT.

## Responsabilidades

- `main.go`: composição de dependências, servidor e encerramento.
- `internal/routes`: métodos/caminhos e grupos de middleware; nunca SQL.
- `internal/middleware`: sessão, CSRF, CORS, limites e headers; nunca regras de pedido.
- `internal/handlers`: controllers HTTP, decodificação, códigos de resposta; nunca SQL.
- `internal/orders`: casos de uso e interface `Store`, sem HTTP/driver.
- `internal/addresses`: casos de uso e interface `Store` da agenda; SQL em `repositories/addresses.go`.
- `internal/billing`: perfil sensível/cartões, interface Store e reautenticação; persistência em `repositories/billing.go`. `internal/secrets` encapsula AES-GCM/HMAC e chave externa; `cmd/keygen` nunca sobrescreve chave.
- `internal/models`: contratos e persistência legada de usuários/produtos/sessões.
- `internal/repositories`: implementação PostgreSQL do contrato de pedidos.
- `db/db.sql`: instalação nova. Alterações incrementais também exigem migration e instruções de execução.
- `cmd/dbsetup`, `internal/bootstrap` e `db/embed.go`: instalação e seeds idempotentes, separados do runtime; não apague nem redefina estoque existente.
- `internal/config` e `internal/server`: configuração validada, política HTTP/TLS e limites de sockets portáveis.
- `cmd/stress`, `internal/loadtest`, `scripts` e `deploy`: verificação/carga limitada e implantação nativa Ubuntu. Evite Docker, CGO e Node em runtime; a máquina da aula tem pouca memória.

## Regras

1. Identidade vem da sessão validada no contexto. Inclua `user_id` no predicado de toda consulta de pedido; não confie em IDs/papéis fornecidos pelo cliente.
2. Preços, totais, desconto, frete, status e dono não são campos de criação do cliente. Faça contas com `NUMERIC`, nunca float.
3. Pedidos reservam estoque e snapshots na mesma transação. Use ordem consistente de locks de produtos. Pagamento/envio futuros devem bloquear a linha do pedido antes de alterar seu estado.
4. `DELETE` significa cancelamento de pedido pendente, com uma única devolução de estoque. Preserve histórico financeiro.
5. SQL parametrizado, JSON estrito, listas/corpos limitados, erros externos sem SQL ou stack traces.
6. Não habilite cookies para CORS `*`; não confie em `X-Forwarded-For` sem proxy confiável explícito. Nunca grave tokens/senhas em logs ou localStorage.
7. Preserve comentários didáticos de Go. Documente novos fluxos e limites reais de segurança.
8. Pedidos exigem address_id do usuário da sessão e preservam snapshot. Agenda arquiva exclusões; quota de 20 ativos usa lock por usuário. Não aceite shipping_address/user_id do cliente.
9. Carrinho/pedido: 50 combinações e 100 unidades somadas, opções conferidas no produto do banco. GREEN10 é calculado com NUMERIC, nunca pelo cliente. Migrações precisam preservar pedidos legados.
10. CPF, telefone, PAN e titular são criptografados; DTOs só devolvem máscaras. Nunca crie campo de CVV, endpoint de PAN completo, log do corpo ou persistência desses dados no navegador. Alterações sensíveis exigem senha atual, CSRF e limitação compartilhada.
11. Nova compra exige perfil completo e cartão próprio/ativo/não expirado; snapshots só bandeira/final. Cartões excluídos perdem ciphertexts; preserve relação dos pedidos antigos. Migração não inventa cartão para pedido legado; não aceite card_required do cliente.
12. Leia [SENSITIVE-DATA.md](docs/SENSITIVE-DATA.md) antes de alterar criptografia, chaves ou escopo de pagamentos. Nunca troque a chave existente sem recriptografia e nunca copie segredos para artefatos públicos.
13. Senhas novas exigem 12 caracteres Unicode (runes). Preserve limite interno do bcrypt sem truncar e login/confirmação de senhas legadas; mensagens públicas devem falar em caracteres, não bytes.

## Verificação

Execute `go test ./...` e `go vet ./...`. Para alterações transacionais, execute também os testes de integração com `TEST_DATABASE_URL` apontando a PostgreSQL descartável. Sem essa variável, integração é ignorada e isso deve ser informado. Os testes criam/removem schemas próprios; não apontar a produção.

O bootstrap testa criação de uma base própria e requer CREATEDB no ambiente descartável. Para mudanças de segurança, leia [TESTING.md](docs/TESTING.md), repita o scanner e reporte testes realmente executados; cross-build não equivale a executar no Ubuntu/Kali. Use Go 1.27.3+ por causa das correções de segurança. Nunca trate a distribuição do atacante como uma garantia de proteção.

Leia [README.md](README.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API.md](docs/API.md), [SECURITY.md](docs/SECURITY.md) e [skills.md](skills.md) antes de evoluir o projeto.
