# Receitas de desenvolvimento

Este arquivo documenta procedimentos locais; não instala plugins ou agentes.

## Adicionar recurso MVC

1. Modele contratos JSON em `internal/models` com campos explícitos.
2. Defina o caso de uso e uma interface pequena no pacote do domínio. Em Go, um tipo implementa uma interface automaticamente quando possui seus métodos; não existe `implements`.
3. Implemente persistência em `internal/repositories`, recebendo `*sql.DB` pelo construtor/composição. Não crie conexão por request.
4. Crie handler que decodifica entrada, usa `r.Context()`, chama caso de uso e serializa resposta. `defer cancel()` libera o timer mesmo quando a função retorna cedo.
5. Registre rotas pelo método no grupo adequado (público, login ou autenticado). A interface `http.Handler` permite compor middlewares como funções que envolvem outro handler.
6. Instancie dependências em `main.go`. Atualize contratos do SPA, documentação e testes de autorização/transação.

## Alterar schema

Atualize `db/db.sql` para instalações novas e crie migration numerada para bancos existentes. Não edite uma migration já registrada: `cmd/dbsetup` verifica checksum e rejeita alterações. As migrations ficam sem BEGIN/COMMIT, pois o preparador gerencia uma transação única; se executadas manualmente, use psql --single-transaction. Não execute o schema inteiro numa base com dados. Faça backup e teste em PostgreSQL descartável.

O preparador usa SQL embutido e advisory lock. Seeds precisam ser idempotentes: jamais redefinir estoque/preço nem substituir imagens existentes. `DATABASE_SETUP_URL`/`DATABASE_ADMIN_URL` só pertencem ao preparador; o HTTP recebe apenas o runtime sem DDL. Prefira Go puro e scripts shell com LF para Ubuntu sem Docker. Verifique Linux amd64/arm64 por cross-build e declare separadamente o que foi executado no destino.

## Investigar falha

Use status e JSON de erro no cliente, logs do servidor para falhas internas e testes pequenos com `httptest`. Nunca adicione logging do corpo de autenticação ou cookies. Verifique a ordem dos middlewares antes de alterar autorização.

## Verificar ataque a estoque

Execute os testes PostgreSQL: duas compras da última unidade devem produzir um sucesso e um conflito; dois cancelamentos devem devolver apenas uma unidade. A interface fake verifica o boundary HTTP; somente o banco real verifica locks, casts e rollback.

## Evoluir endereços, carrinho e opções

Pedido exige address_id do mesmo usuário; não volte a aceitar endereço avulso no JSON. Preserve snapshots e arquive endereços excluídos. Ao mexer na quota de 20 ativos, teste cadastros simultâneos. Opções são escolhas do banco e usam estoque/preço compartilhado do produto; cliente nunca determina preço. Preserve limite de 50 combinações e 100 unidades somadas mesmo quando a UI for contornada.

No React, use as stores Zustand e o modal na raiz, Form/Field/useForm para etapas e caminhos de arrays, seguindo [UI-FLOWS.md](../ecommerce-front-spa/docs/UI-FLOWS.md). Leia também o contrato em [API.md](docs/API.md). Teste migration de pedido legado, autoria de endereço, opções inválidas com rollback e manutenção dos snapshots.

## Perfil e cartões

Use `billing.Service`, `BillingStore`, `BillingHandler` e `secrets.Vault`. Nunca receba user_id nem devolva PAN/titular completos. AAD vincula cifra ao usuário/campo, o canário confere a chave no startup e keygen nunca sobrescreve o arquivo. Alterações exigem senha atual, CSRF, TLS (exceto desenvolvimento loopback) e cota compartilhada. Preserve 10 cartões ativos, quotas sob concorrência, arquivamento com limpeza de ciphertext e FK/snapshot de pedidos. Nunca crie CVV ou simule cobrança real. Siga [SENSITIVE-DATA.md](docs/SENSITIVE-DATA.md), teste chave errada, IDOR, expiração, migração e recusa de dados sensíveis no storage do carrinho.
