# GreenStore — monólito Go + React

Projeto didático para a aula de Segurança de Sistemas. O autor está aprendendo Go; os comentários e o [guia de arquitetura](docs/ARCHITECTURE.md) explicam o caminho da requisição e os mecanismos da linguagem.

Go serve a API em `/api/*` e o build React em `/*`. O frontend continua usando TanStack Router/Query, Valibot, Tailwind e a identidade GreenStore. Não há JWT: a sessão é persistida no PostgreSQL e identificada por cookie opaco.

## Executar

Requisitos de desenvolvimento: Go 1.27.3+ (atualizado por segurança), PostgreSQL 14+ com `pgcrypto`, Node compatível com o Vite instalado e npm. No servidor Ubuntu bastam os binários e PostgreSQL: veja [implantação sem Docker](deploy/ubuntu.md). Os comandos abaixo partem da raiz deste projeto Go; no PowerShell use `npm.cmd` se `npm.ps1` estiver bloqueado.

1. Copie `.env.example` para `.env` e configure `DATABASE_URL`. Não versione credenciais.
2. Execute `go run ./cmd/dbsetup` (no Linux também `sh scripts/setup-db.sh`). Se a base não existir, o usuário de preparação precisa de CREATEDB ou de `DATABASE_ADMIN_URL`. Em schema vazio instala `db.sql`; em schema existente aplica migrations versionadas. Tudo que altera schema/dados fica em transação; criação da base é uma operação separada do PostgreSQL.
3. Execute `go run ./cmd/dbsetup --check`. O seed usa `products.sql` e `products-images.sql` (esse é o nome real do arquivo, no plural). Reexecutar não duplica produtos/imagens, não redefine estoque/preço e não apaga dados. Migrations com checksum diferente são recusadas; schema parcialmente instalado gera diagnóstico, em vez de reinstalação destrutiva. Não execute o `db.sql` inteiro numa base com dados. O servidor HTTP não executa DDL nem precisa de credencial administrativa.
4. No diretório `../ecommerce-front-spa`, execute `npm ci` e `npm run build`.
5. Neste diretório, gere a chave **uma única vez** com `go run ./cmd/keygen`. `DATA_KEY_FILE` aponta ao arquivo (padrão `.secrets/data.key`). Guarde um backup seguro e não versione. Arquivo existente nunca é sobrescrito; não regenere uma chave com dados já gravados.
6. Execute `go run .` e acesse `http://localhost:8080`.

Para desenvolver React, execute `npm run dev` no SPA e abra `http://localhost:5173`. O proxy Vite envia `/api` ao Go. O Go continua na porta 8080. Configure `CORS_ALLOWED_ORIGINS` com origens completas, sem caminhos nem barra final. O catálogo pode ser lido de qualquer origem sem cookies; operações de sessão entre origens exigem confiança explícita.

`SPA_DIR` aponta ao build (padrão `../ecommerce-front-spa/dist`, relativo ao diretório de execução); `HTTP_ADDR` define o endereço de escuta (padrão `:8080`). `PRODUCTION=1` ativa `Secure` no cookie: use HTTPS na implantação. Configure TLS, HSTS e proteção de tráfego no proxy de borda conforme [SECURITY.md](docs/SECURITY.md).

Cadastre sua conta em `/conta`. O preparador inclui 109 produtos de demonstração e imagens para produtos sem vendedor que ainda não tenham imagem. Adicione ao carrinho, informe o endereço e crie um pedido. Veja, edite endereço ou cancele em `/pedidos`.

Se o catálogo retorna `could not list products`, consulte o log do servidor e execute `dbsetup --check`. A causa encontrada nesta implementação foi a ausência da tabela `products`. O servidor agora verifica o schema no startup e falha com instrução de preparação, evitando subir uma API que responderia 500 a todas as consultas.

Os limites padrão para pouca memória são pool de 4 conexões, 16 requests simultâneos, 128 sockets/32 por IP e 180 requests/min/IP. Configuração validada via `DB_MAX_CONNECTIONS`, `HTTP_MAX_INFLIGHT`, `HTTP_MAX_CONNECTIONS`, `HTTP_CONNECTIONS_PER_IP` e `HTTP_RATE_PER_MINUTE`. TLS direto pode ser configurado por `TLS_CERT_FILE` e `TLS_KEY_FILE`, sem proxy extra. Assets com hash do Vite têm cache público imutável; respostas privadas e HTML continuam no-store.

## Escopo entregue

CRUD de pedidos e endereços do próprio cliente, catálogo público, cadastro/login/logout, consulta de sessão, carrinho persistido e checkout. Todo pedido exige endereço salvo do mesmo usuário, com snapshot da entrega e das opções do produto. Frete é zero; GREEN10 aplica 10% até R$ 50 no servidor. Editar pedido significa trocar endereço enquanto pendente; para alterar itens, cancele e crie outro pedido. Excluir pedido significa cancelar, preservando histórico. Excluir endereço arquiva a agenda sem perder pedidos.

As migrations 003/004 acrescentam vínculo obrigatório de endereço, opções e cupom; a 005 acrescenta CPF/telefone criptografados, cartões e vínculo de novas compras. `go run ./cmd/dbsetup` atualiza bases existentes e preserva pedidos legados. Complete CPF/telefone em Minha conta, cadastre um cartão de teste e selecione-o no carrinho. Leia [dados sensíveis e arquitetura](docs/SENSITIVE-DATA.md) e [o fluxo da View](../ecommerce-front-spa/docs/UI-FLOWS.md).

As tabelas de pagamentos e remessas são consideradas ao bloquear alterações, mas integrações com gateway, pagamento real, CRUD administrativo de produtos/usuários/remessas e transições operacionais de envio não fazem parte deste incremento. O cartão identifica o meio escolhido no pedido didático: não há cobrança ou autorização bancária. Use dados fictícios; não há CVV no formulário, contrato ou banco.

## Verificação

```powershell
go test ./...
go vet ./...
# Integração: PostgreSQL descartável, nunca produção.
$env:TEST_DATABASE_URL='host=127.0.0.1 port=55432 user=postgres dbname=postgres sslmode=disable'
go test ./... -count=1
```

Sem `TEST_DATABASE_URL`, os testes PostgreSQL são ignorados; testes unitários continuam funcionando. Integração cria e remove schemas exclusivos, testa SQL real, concorrência, rollback, autorização, cookie/CSRF e logout. No SPA execute `npm test`, `npm run lint` e `npm run build`.

Leia [API](docs/API.md), [arquitetura](docs/ARCHITECTURE.md), [segurança](docs/SECURITY.md), [AGENTS](AGENTS.md) e [receitas](skills.md).

Para testes de abuso, fuzzing e carga controlada, veja [TESTING.md](docs/TESTING.md) e as [medições executadas](docs/TEST-RESULTS.md). A origem Kali não muda a autorização nem fornece imunidade a ferramentas: as defesas cobrem vetores e limites explícitos; saturação de rede exige proteção fora do processo.
