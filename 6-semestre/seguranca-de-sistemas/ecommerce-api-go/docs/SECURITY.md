# Segurança e limites operacionais

Este é um projeto de estudo com defesas em camadas; não há garantia de resistência a todo ataque. A aplicação aceita tráfego público, mas pedidos exigem autenticação e pertencimento. CORS não é firewall.

## Medidas implementadas

| Ameaça | Controle |
| --- | --- |
| Fixação/roubo de sessão por script | Token novo de 32 bytes aleatórios no login; só SHA-256 persistido; cookie HttpOnly, SameSite=Lax e Secure com PRODUCTION=1 |
| Sessão revogada/conta bloqueada | Validação no PostgreSQL em cada request privado; TTL absoluto de 24h; logout revoga imediatamente; até cinco sessões ativas por conta |
| Crescimento de sessões antigas | Limpeza em lotes de 1000, no início e a cada dez minutos; expiradas e revogadas há mais de um dia |
| CSRF | Token vinculado ao segredo da sessão, header X-CSRF-Token, comparação em tempo constante; JSON obrigatório; origens de escrita conferidas |
| Acesso a pedidos de terceiros (IDOR) | Dono sempre vem do contexto; WHERE inclui user_id em leitura, lock, edição e cancelamento |
| Endereço de outro usuário | Agenda filtra dono; compra exige ativo do dono; FK composta endereço/usuário; DELETE arquiva sem perder histórico |
| Vazamento de CPF/telefone/PAN/titular | AES-256-GCM, nonce aleatório/AAD por dono e campo, chave externa, DTOs mascarados e sem CVV |
| Abuso de sessão em cadastro sensível | Senha atual, lockout, CSRF e cota compartilhada de escritas; dois bcrypt simultâneos no grupo novo |
| Cartão alheio/expirado/arquivado | WHERE por usuário/estado/validade, FK composta e snapshot de bandeira/final; limpeza de ciphertext na exclusão |
| Carrinho/variações adulteradas | 50 linhas/100 unidades somadas no frontend e API; opções conferidas no produto; preços/descontos calculados no banco |
| SQL injection/mass assignment | Parâmetros SQL, whitelist de busca, UUIDs validados, structs JSON de entrada restritas; cliente não escolhe preço, papel ou status |
| Manipulação financeira/overselling | NUMERIC, constraints, preços do banco, transação, snapshots e atualização de estoque com lock e predicado; cancelamento serializado |
| Força bruta/custo bcrypt | Orçamento compartilhado de 10 requests/min/IP para cadastro/login; no máximo quatro hashes simultâneos; lock por conta de 15 minutos após cinco falhas; resposta genérica e dummy bcrypt para usuário ausente |
| Exaustão de memória/CPU/banco | Padrão de 180 requests/min/IP, até 4096 entradas no limiter com varredura limitada; 16 requests simultâneos; pool de quatro conexões; corpos JSON 64 KiB; paginação/tamanho/busca/itens limitados |
| Sockets e slow requests | Até 128 sockets/32 por IP antes do HTTP, liberação com sync.Once; ReadHeaderTimeout 3s, ReadTimeout/WriteTimeout 10s, IdleTimeout 15s, header máximo 16 KiB |
| Consultas lentas e bloqueadas | Context deadline, statement_timeout de 4s e lock_timeout de 2s no PostgreSQL |
| Framing e dados binários | HTTP/1 chunked não suportado; parser rejeita Content-Length conflitante; texto NUL, controles e UTF-8 inválido rejeitados antes do banco |
| XSS/clickjacking/MIME sniffing | React escapa textos; CSP, frame-ancestors none, X-Frame-Options DENY e nosniff; sem HTML externo injetado |
| Cache de dados privados | Cache-Control no-store no HTML/API e cache de pedidos no React separado por usuário; apenas assets públicos com hash usam cache imutável |
| Falha de handler | Recover registra erro no servidor e retorna mensagem genérica; transações abortam em erro |

Não se armazena senha em texto, JWT ou token de sessão no localStorage. SHA-256 serve para token aleatório de alta entropia; senha usa bcrypt de custo 12. O bloqueio por conta pode ser abusado para impedir temporariamente login de uma vítima: avalie desafios progressivos e recuperação de conta ao evoluir o sistema.

## CORS público e sessão

Qualquer origem pode ler o catálogo com `Access-Control-Allow-Origin: *`, sem credenciais. Origens explicitadas em `CORS_ALLOWED_ORIGINS` (ou a origem do próprio servidor) recebem sua origem exata e `Access-Control-Allow-Credentials: true`. Nunca use uma entrada `*` para confiar cookies; ela é ignorada na lista de confiança.

Escritas com Origin externo não confiável são rejeitadas, inclusive login/cadastro e preflight. Requests sem Origin são aceitos para clientes de API, mas continuam sujeitos à autenticação e CSRF. As origens confiáveis precisam estar sob seu controle. Não refletir qualquer Origin junto de credenciais: isso permitiria ler dados e agir pela sessão da vítima. O desenho segue as recomendações de [CSRF da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Não se usa SameSite=None; terceiros de outro site não podem reutilizar cookies da sessão do monólito. SameSite é uma camada adicional, não substitui CSRF. A lista de CORS não transforma páginas externas em clientes autorizados a pedidos alheios.

## DDoS e implantação

Limites em Go ajudam contra abuso na camada HTTP, mas o processo não impede saturação do link, ataques distribuídos com muitos IPs ou conexões aceitas antes do middleware. A [OWASP recomenda limites também na infraestrutura](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html).

Em implantação pública, termine TLS num proxy/CDN com mitigação de DDoS e imponha limites de conexões, taxa, tamanho, timeout e banda **antes** do Go. Restrinja acesso direto à porta do aplicativo e ao PostgreSQL, use usuário de banco com privilégio mínimo (sem DDL para runtime), mantenha backups e monitore 429/503/latência/conexões. HSTS deve ser aplicado na borda HTTPS; o Go só o adiciona quando recebe TLS diretamente. Defina PRODUCTION=1 e origens HTTPS explícitas.

No laboratório com pouca memória, HTTPS pode terminar diretamente no Go por `TLS_CERT_FILE`/`TLS_KEY_FILE`, sem proxy, contêiner ou Node em runtime. O mínimo TLS é 1.2 e HSTS é emitido no HTTPS direto. Isso reduz componentes, mas não oferece mitigação de tráfego volumétrico fora da máquina. [deploy/ubuntu.md](../deploy/ubuntu.md) inclui unidade systemd com limite de RAM/processos, filesystem somente leitura, papéis de banco separados e configuração nativa de PostgreSQL. Esses modelos ainda precisam de validação no Ubuntu de destino.

O limiter atual é local ao processo e usa `RemoteAddr`; não confia em X-Forwarded-For nem X-Real-IP. Atrás de proxy, ele vê o IP do proxy e o orçamento fica compartilhado. Aplique os limites por cliente na borda e calibre o orçamento do aplicativo para essa topologia. Não passe a confiar em headers arbitrários. Ao escalar réplicas, use controle compartilhado de tráfego na borda; as sessões já são compartilháveis via PostgreSQL.

O encerramento recebe sinal, para novas conexões e aguarda requests por até 15 segundos. Ajuste o período de drenagem do orquestrador a esse prazo. Atualize Go/dependências e execute scanner de vulnerabilidades antes de publicar; lint/test/build não equivalem a pentest ou auditoria de dependências.

## Verificações de regressão

Os testes automatizados cobrem origem confiável e pública, preflight, CSRF, sessões, limite por IP com forwarded header forjado, concorrência, JSON, isolamento API/SPA e input inválido. PostgreSQL cobre transação/rollback, última unidade/cancelamento concorrentes, snapshot, IDOR, CRUD, logout, bloqueio/expiração/limite/limpeza de sessões e lockout. Foram acrescentados testes adversariais de injeção/XSS/mass assignment, sockets reais, headers lentos/grandes, framing, TLS e recuperação após flood, além de fuzzing e cargas GET locais com SQL real. Veja [TESTING.md](TESTING.md) e [resultados](TEST-RESULTS.md). Não foram executados ataques distribuídos, saturação de rede nem ferramentas reais do Kali.

As dependências foram atualizadas e Go 1.27.3 passou a ser o mínimo. O govulncheck encontrou zero vulnerabilidades alcançáveis após a atualização; permanece um aviso no OpenPGP não importado do módulo x/crypto (registrado no relatório). Isso é uma fotografia da base de vulnerabilidades consultada, não garantia permanente. Repita a análise ao atualizar ou publicar.

Ainda faltam verificação de email, redefinição de senha, MFA, observabilidade central, política de retenção de auditoria, chave de idempotência para compra, pagamento/frete real e ensaios no hardware da aula. Planeje também expiração de reservas de pedidos pendentes para impedir retenção prolongada do estoque por contas abusivas. Os limites atuais são conservadores e precisam de medição no ambiente da aula.

## View, armazenamento e endereços

Carrinho usa Zustand e localStorage somente para IDs/opções/quantidades, sem credenciais, dados pessoais ou preços. O adaptador limita o texto a 8192 caracteres UTF-16 antes de JSON.parse, valida envelope/versão, 50 linhas/100 unidades, UUIDs, valores, duplicatas e chaves de protótipo. Falha/quota do storage mantém a UI em memória. Valores locais continuam não confiáveis; limites, estoque, cupom e autorizações são repetidos no servidor. Isso segue as [orientações OWASP para armazenamento no navegador](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage).

Formulários controlados usam noValidate e schemas; asteriscos/erros de campo não substituem validação da API. Endereços são texto, renderizados com JSX normal e JSON escapado; não são inseridos como HTML. Evite `dangerouslySetInnerHTML` com entrada externa, como explica a [documentação React](https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html). Caminhos de formulário também bloqueiam nomes de protótipo, profundidade/índices excessivos. Caches de endereços são privados por usuário e removidos junto aos pedidos ao trocar de sessão.

A quota de 20 endereços ativos por usuário usa lock para não ser ultrapassada por requisições concorrentes. Arquivamento conserva histórico; não é retenção ilimitada planejada: ainda são necessárias políticas de retenção para agendas arquivadas e contas abusivas. Um atacante com controle do JavaScript da origem ainda pode ler localStorage; a prevenção de XSS e a autoridade do servidor continuam essenciais.

## Dados pessoais e meios de pagamento

CPF, telefone e cartões foram isolados no módulo billing. Perfil/cartões exigem TLS fora do desenvolvimento loopback e sempre com PRODUCTION=1, sem confiar em X-Forwarded-Proto. Confirme HTTPS direto no Go no laboratório; Vite de desenvolvimento não deve ser exposto na rede. Máscaras são as únicas respostas; campos completos/senha não são persistidos no navegador nem registrados na auditoria. Chaves de query são por usuário e mutations transitórias usam gcTime 0. O canário no banco recusa uma chave trocada acidentalmente no startup. Nenhuma chave é embutida ou gerada automaticamente pelo runtime.

Até 10 cartões ativos por usuário, quota serializada e duplicidade por fingerprint HMAC. Remover cartão limpa número/titular criptografados e preserva a referência de pedidos. Não há armazenamento de CVV ou cobrança real. A validação de CPF/Luhn/telefone não confirma identidade, posse ou autorização bancária. Nomes/email/endereços anteriores continuam em texto no banco; este incremento não promete criptografia de campo para todo o projeto.

Leia [SENSITIVE-DATA.md](SENSITIVE-DATA.md), incluindo referências OWASP/PCI, gestão de chaves, limitações e requisitos ainda não cobertos. Antes de pagamento real seriam necessários provedor/tokenização, autorização da transação, idempotência e avaliação PCI; antes de expor dados reais, também política de retenção, restauração, monitoramento e análise operacional. A arquitetura admite essas extensões, mas o projeto continua acadêmico.
