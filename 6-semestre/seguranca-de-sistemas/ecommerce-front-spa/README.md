# GreenStore SPA

React + TypeScript, Zustand, TanStack Router/Query, Valibot, Tailwind e Vite. O visual verde da GreenStore é compartilhado pelo catálogo, conta, carrinho e pedidos.

## Executar

```bash
npm ci
npm run dev
```

Mantenha o Go rodando em `http://localhost:8080`. O Vite encaminha `/api` ao backend; o navegador usa a mesma origem e cookies HttpOnly. No PowerShell, use `npm.cmd` se a execução de scripts bloquear `npm.ps1`.

Para o backend novo, aplique `go run ./cmd/dbsetup` e gere a chave uma vez com `go run ./cmd/keygen` no diretório Go. Para acessar perfil/cartões pela rede da faculdade é obrigatório HTTPS; HTTP desses endpoints funciona só em desenvolvimento loopback. Configure TLS conforme o guia Ubuntu.

Para servir tudo pelo monólito:

```bash
npm run build
cd ../ecommerce-api-go
go run .
```

Abra `http://localhost:8080`. O build fica em `dist` e o Go faz fallback HTML das rotas do SPA. API desconhecida e assets ausentes continuam retornando 404.

## Telas e fluxo

| Rota | Conteúdo |
| --- | --- |
| `/` | Carrossel animado de promoções, catálogo e busca |
| `/produtos/:id` | Galeria, descrição completa, opções, preço e início de compra |
| `/conta` | Cadastro, sessão, CPF/telefone e agenda de endereços/cartões |
| `/cart` | Modal de edição/exclusão, opções e checkout com endereço e cartão salvos |
| `/carrinho` | Redirecionamento para `/cart` |
| `/pedidos` | Lista paginada dos pedidos da sessão |
| `/pedidos/$orderId` | Itens, totais, atualização de endereço e cancelamento |

As páginas são carregadas por `import()` via `lazyRouteComponent`; o Vite gera chunks automaticamente. Zustand persiste somente IDs/opções/quantidades no localStorage: até 50 linhas, 100 unidades e 16 KiB. Preços/estoque são conferidos pela API. Frete é zero e GREEN10 concede 10% até R$ 50, calculados no servidor.

O modal global fica em `src/CartModal.tsx`; o Cart Context foi removido. Formulários usam `Form`, `Field` e `useForm`, com `noValidate`, erros por campo, etapas e caminhos para arrays. Veja exemplos e o fluxo completo em [UI-FLOWS.md](docs/UI-FLOWS.md). Prepare o backend atualizado com `go run ./cmd/dbsetup` para aplicar as migrations de endereços/opções.

Minha conta permite preencher CPF/telefone e adicionar até 10 cartões com confirmação da senha atual. Respostas exibem apenas máscaras; formulários completos não vão ao localStorage/Zustand. Novas compras exigem perfil completo e cartão próprio/ativo/válido. Use dados fictícios e cartões de teste: não há CVV nem cobrança real. Veja [SENSITIVE-DATA.md](../ecommerce-api-go/docs/SENSITIVE-DATA.md) para arquitetura, testes e limitações.

O header inclui busca por URL (`/?q=ssd`) e atalhos de catálogo. Clique no card fora do botão para abrir o produto. Comprar agora confirma quantidade/opções e abre o checkout com os demais itens preservados. CPF, telefone, cartão, validade e CEP brasileiro possuem máscaras reutilizáveis. Modais de cadastro não fecham ao clicar fora; o carrinho mantém esse comportamento. Senhas novas são orientadas por mínimo de 12 caracteres, preservando o acesso às contas existentes.

`src/service` é a fronteira de API. `callApi` centraliza cookies, CSRF, erros JSON e respostas 204; serviços de domínio validam entrada e resposta com Valibot. Tipos de pedido são inferidos dos schemas. `SessionGate` orienta o usuário, enquanto o servidor verifica sessão, CSRF e dono do recurso.

O token de sessão nunca é acessível ao JavaScript. O token CSRF fica em memória e é recuperado por `/api/auth/session` após reload. Pedidos no cache incluem o ID do usuário e são removidos ao trocar de conta. Mutações de compra não têm repetição automática: se ocorrer falha de rede depois do envio, consulte seus pedidos antes de tentar novamente.

## Verificar

```bash
npm run lint
npm run build
npm test
```

O build executa TypeScript antes do Vite. `npm test` usa o runner nativo do Node (22.6+ com strip de TypeScript): transporte, carrinho adulterado/grande, limites, persistência e formulários aninhados. Autorização, transação e concorrência são verificadas nos testes Go/PostgreSQL. Não há suíte automatizada de navegador nesta versão; gestos/animações ainda precisam de inspeção visual local.

Veja [AGENTS.md](AGENTS.md), [skills.md](skills.md) e a [documentação do monólito](../ecommerce-api-go/README.md), incluindo setup do banco e limites de segurança.
