# Ubuntu sem Docker

O destino previsto é Ubuntu 22.04/24.04 ou mais recente, PostgreSQL 14+ e CPU amd64 (x86-64) ou arm64. O backend usa Go puro, sem CGO, libc específica, comandos Windows ou um processo Node em produção. Os binários devem corresponder à arquitetura de `uname -m`.

Nesta sessão foram feitos cross-builds Linux e testes locais no Windows. Não havia Ubuntu/WSL nem Kali disponíveis; os binários, a unidade systemd e o firewall ainda precisam de verificação na máquina da faculdade. Não existe garantia para qualquer kernel: confira os [requisitos oficiais do Go](https://go.dev/wiki/MinimumRequirements), mantenha o Ubuntu atualizado e faça o smoke test abaixo no destino.

## Build fora do computador da faculdade

Use Go **1.27.3 ou patch posterior corrigido**. O `go.mod` pede essa versão porque a varredura encontrou problemas nas versões anteriores. O comando Go pode baixar o toolchain automaticamente durante o build; em ambiente offline, instale-o antes. Node/npm são necessários somente para construir o SPA.

```sh
cd ecommerce-front-spa
npm ci
npm test
npm run lint
npm run build
cd ../ecommerce-api-go
sh scripts/build.sh
# Para aarch64: GOARCH=arm64 sh scripts/build.sh
```

Copie o conteúdo de `dist-server` para `/opt/greenstore` no Ubuntu. Ele contém `greenstore`, `dbsetup`, `keygen`, `stress` e `spa/`. O SQL está embutido em `dbsetup`. Não copie `.env`, `node_modules`, fontes, caches ou credenciais da sua máquina.

No PowerShell também é possível compilar diretamente:

```powershell
$env:CGO_ENABLED='0'
$env:GOOS='linux'
$env:GOARCH='amd64'
go build -trimpath -ldflags '-s -w' -o dist-server/greenstore .
go build -trimpath -ldflags '-s -w' -o dist-server/dbsetup ./cmd/dbsetup
```

Copie também o `dist` do frontend para `dist-server/spa`. Para construir ferramentas Windows de novo, remova `GOOS`/`GOARCH` do ambiente. O servidor final não precisa de Go, compilador C, npm ou Docker instalados.

## PostgreSQL e papéis

Instale os pacotes nativos (uma única instância de PostgreSQL):

```sh
sudo apt update
sudo apt install --no-install-recommends postgresql postgresql-contrib ca-certificates
sudo -u postgres psql -v ON_ERROR_STOP=1
```

No psql, crie credenciais separadas. `\password` pede a senha sem gravá-la como SQL no histórico:

```sql
CREATE ROLE greenstore_owner LOGIN CREATEDB;
\password greenstore_owner
CREATE ROLE greenstore_app LOGIN;
\password greenstore_app
\q
```

Crie um arquivo `setup.env`, acessível apenas ao administrador (`chmod 600 setup.env`), com:

```dotenv
DATABASE_SETUP_URL=host=127.0.0.1 port=5432 dbname=greenstore user=greenstore_owner password='SUA SENHA' sslmode=disable
```

Execute como o usuário administrador que pode ler esse arquivo:

```sh
/opt/greenstore/dbsetup --env ./setup.env
```

O comando conecta, cria `greenstore` se ausente, instala schema se vazio, aplica migrations e insere produtos/imagens faltantes na mesma transação. Ele não reinstala o PostgreSQL, não cria usuários do SO, não apaga dados nem redefine estoque. Se o dono não tiver CREATEDB, forneça `DATABASE_ADMIN_URL` para uma conexão administrativa **somente no preparador**. Não forneça essa credencial ao processo HTTP.

Depois da preparação, restrinja o runtime (psql como postgres):

```sql
ALTER ROLE greenstore_owner NOCREATEDB;
\connect greenstore
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE CONNECT ON DATABASE greenstore FROM PUBLIC;
GRANT CONNECT ON DATABASE greenstore TO greenstore_app, greenstore_owner;
GRANT USAGE ON SCHEMA public TO greenstore_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO greenstore_app;
GRANT INSERT, UPDATE ON users, sessions, orders, order_items, user_addresses, user_profiles, credit_cards TO greenstore_app;
GRANT INSERT ON data_key_checks TO greenstore_app;
GRANT UPDATE ON products TO greenstore_app;
GRANT INSERT ON audit_logs TO greenstore_app;
GRANT DELETE ON sessions TO greenstore_app;
```

O aplicativo não é dono das tabelas e não precisa de superuser, CREATEDB ou DDL. Novas funcionalidades/migrations devem revisar os grants. Guarde `setup.env` fora do diretório servido e do usuário do serviço. Para recriar uma base ausente no futuro, o preparador precisa novamente de um administrador ou de CREATEDB no dono.

Mantenha o PostgreSQL escutando apenas no loopback e autenticação `scram-sha-256` no `pg_hba.conf`. `sslmode=disable` aqui vale para o tráfego de banco **local**; banco remoto exige TLS com validação. O arquivo [postgresql-low-memory.conf](postgresql-low-memory.conf) oferece um ponto de partida de 32 MB de shared_buffers/24 conexões para um cluster dedicado. Não aplique num cluster compartilhado sem avaliar os demais bancos. Reinicie PostgreSQL após mudar parâmetros que exigem restart.

## Serviço e HTTPS

Crie o usuário sem login, mantenha binário e SPA sob propriedade de root e o diretório legível pelo serviço:

```sh
sudo useradd --system --home-dir /nonexistent --shell /usr/sbin/nologin greenstore
sudo chown -R root:root /opt/greenstore
sudo chmod 755 /opt/greenstore /opt/greenstore/greenstore /opt/greenstore/dbsetup /opt/greenstore/keygen /opt/greenstore/stress
# Somente na instalação inicial. keygen recusa sobrescrever uma chave existente.
sudo install -d -o greenstore -g greenstore -m 700 /etc/greenstore/secrets
sudo -u greenstore /opt/greenstore/keygen -out /etc/greenstore/secrets/data.key
```

Crie `/etc/greenstore.env` com permissão 600 e proprietário root. Exemplo de produção com TLS direto no Go, sem proxy extra:

```dotenv
DATABASE_URL=host=127.0.0.1 port=5432 dbname=greenstore user=greenstore_app password='SUA SENHA DO APP' sslmode=disable
DATA_KEY_FILE=/etc/greenstore/secrets/data.key
SPA_DIR=/opt/greenstore/spa
HTTP_ADDR=:8443
PRODUCTION=1
CORS_ALLOWED_ORIGINS=https://seu-host-da-faculdade:8443
TLS_CERT_FILE=/etc/greenstore/tls/fullchain.pem
TLS_KEY_FILE=/etc/greenstore/tls/privkey.pem
DB_MAX_CONNECTIONS=4
HTTP_MAX_INFLIGHT=16
HTTP_MAX_CONNECTIONS=128
HTTP_CONNECTIONS_PER_IP=32
HTTP_RATE_PER_MINUTE=180
```

Use certificado válido para o nome do servidor, emitido por autoridade confiável ou pela PKI da faculdade. O usuário `greenstore` precisa ler a chave (por exemplo root:greenstore, modo 640); outros usuários não. Sem TLS, quem captura tráfego HTTP na rede pode roubar a sessão. `PRODUCTION=1` impede o envio do cookie por HTTP. Não use configuração de laboratório HTTP em uma rede hostil.

A chave de **dados** é separada da chave TLS: `data.key` precisa ser do usuário greenstore e modo 600. Faça backup protegido da chave, separado do backup do PostgreSQL. O startup grava/confere um canário autenticado e recusa uma chave trocada acidentalmente. Não regenere a chave ao reinstalar nem a copie para o SPA. Rotação exige uma migração offline de recriptografia; veja [SENSITIVE-DATA.md](../docs/SENSITIVE-DATA.md). O serviço só precisa ler a chave e inserir o canário inicial, sem UPDATE/DELETE nessa tabela.

```sh
sudo cp deploy/greenstore.service /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/greenstore.service
sudo systemctl daemon-reload
sudo systemctl enable --now greenstore
sudo systemctl status greenstore
sudo journalctl -u greenstore -n 50 --no-pager
```

O serviço usa `GOMEMLIMIT=96MiB` (meta de heap, não limite de RAM do processo), `MemoryHigh=192M`, `MemoryMax=256M`, descritores limitados e filesystem somente leitura. O PostgreSQL tem seu orçamento separado. Os controles de [systemd](https://www.freedesktop.org/software/systemd/man/latest/systemd.resource-control.html) dependem do kernel/cgroups; confira sua efetividade no destino com `systemctl show greenstore -p MemoryCurrent -p MemoryPeak`.

Permita no firewall somente a porta HTTPS necessária e, se possível, a rede da aula. Mantenha PostgreSQL/5432 inacessível aos clientes. Preserve o acesso administrativo ao configurar regras. O aplicativo não altera firewall, sysctl ou políticas do computador automaticamente. Limites de sockets/taxa ajudam, mas não impedem saturação da rede ou SYN flood antes do processo.

## Smoke test no destino

```sh
uname -m
uname -r
file /opt/greenstore/greenstore
ldd /opt/greenstore/greenstore   # esperado: não é executável dinâmico
/opt/greenstore/dbsetup --env /caminho/admin/check.env --check
curl --fail https://seu-host-da-faculdade:8443/api/products
curl -I -H 'Accept: text/html' https://seu-host-da-faculdade:8443/pedidos
```

O `check.env` contém apenas a conexão do runtime e é lido pelo administrador. Valide cadastro/login, carrinho, criação, edição e cancelamento no navegador HTTPS do destino. Em seguida execute os testes/carga conforme [TESTING.md](../docs/TESTING.md), observando memória, latência e logs. Não use `curl -k` como configuração de operação: instale a cadeia de confiança correta para a PKI do laboratório.
