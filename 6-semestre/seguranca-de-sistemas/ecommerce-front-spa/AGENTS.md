# GreenStore Agent Guide

## Contexto

GreenStore é uma SPA de ecommerce construída com React e TypeScript. A aplicação consome `/api` na mesma origem, servida pelo monólito Go. No desenvolvimento, o Vite encaminha `/api` a `http://localhost:8080`. O autor está aprendendo Go; preserve explicações didáticas dos fluxos entre frontend e backend.

## Arquitetura

A aplicação segue uma separação simples por responsabilidade:

- `src/main.tsx`: ponto de entrada e composição dos providers.
- `src/App.tsx`: shell visual compartilhado, StoreHeader, modal global e Outlet. Header fica em `common/layout/StoreHeader.tsx`.
- `src/routes/router.tsx`: gerenciador de rotas e composição da árvore de rotas.
- `src/routes/index.tsx`: página `/`, busca, infinite query e estados da listagem.
- `src/components/common`: componentes visuais reutilizáveis.
- `src/service`: fronteira de comunicação com a API.
- `src/schemas`: schemas Valibot para validar requests, formulários e respostas.
- `src/utils`: funções utilitárias reutilizáveis, como `parseForm`.
- `src/style`: identidade visual e tokens de cor.
- `src/types`: contratos globais TypeScript da API e do domínio.
- `src/assets`: logos, imagens de fallback e outros assets estáticos.

## Fluxo Principal

1. `main.tsx` cria o `QueryClient` e renderiza o `RouterProvider`.
2. `router.tsx` encaminha `/` para `ProductsPage`.
3. Header controla a digitação; busca validada fica no parâmetro q da URL. ProductsPage lê q pelo router.
4. `useInfiniteQuery` chama `fetchProducts` por página.
5. `fetchProducts` valida os parâmetros com `ProductQueryParamsRequestSchema`.
6. `callApi` executa a requisição HTTP e normaliza erros de transporte.
7. A resposta é validada com `ProductResponseSchema`.
8. Os produtos são renderizados por `ProductCard`.
9. `ProductImage` usa a URL do produto e cai para `no-image-product.png` quando necessário.
10. O card abre `/produtos/$productId`; a página carrega detalhes/galeria em chunk próprio. Comprar agora confirma no modal, acrescenta ao carrinho e abre o checkout sem apagar itens anteriores.

## Regras de Implementação

- Preserve a separação entre router e páginas: novos routes ficam em `src/routes/`.
- Use `callApi` para chamadas HTTP; não use `fetch` diretamente nas páginas ou componentes.
- Valide payloads externos com Valibot antes de usá-los na UI.
- Mantenha inputs controlados pelo React (`value` + `onChange`).
- Não use `FormEvent` para a busca; componentes de input devem expor callbacks de intenção, como `onSearch`.
- Prefira componentes reutilizáveis em `src/components/common`.
- Use os tokens do `src/style/colors.ts` por meio das classes do Tailwind, evitando hexadecimais espalhados pelos componentes.
- Imagens externas devem possuir `alt` e fallback visual.
- Preserve os contratos snake_case da API, como `stock_quantity` e `total_pages`.
- Não adicione dependências quando uma solução já existir nas libs instaladas.
- Novas páginas usam `lazyRouteComponent` e `import()` no router para criar chunks do Vite.
- Sessão usa cookie HttpOnly e CSRF em memória; nunca localStorage/JWT. Use os serviços de autenticação/pedidos, sem montar credenciais nos componentes.
- Pedidos usam query keys com ID do usuário; remova o cache ao trocar de conta.
- Dinheiro da API é string decimal. Preços do carrinho são estimativas; total e estoque são decididos pelo servidor.
- Preserve os estados de loading, erro, vazio e mutação; não repita criação de pedidos automaticamente.
- Carrinho usa `src/stores/cart-core.ts`/`cart.ts`, modal usa `cart-modal.ts` e `src/CartModal.tsx`; não reintroduza Cart Context. Persista somente IDs/opções/quantidades, nunca dados privados ou preços.
- Preserve limites de 50 linhas/100 unidades/16 KiB e validação antes de JSON.parse; o servidor repete as regras.
- Formulários usam `Form`, `Field`, `useForm` e schemas: noValidate, obrigatórios com *, erros abaixo dos campos, caminhos aninhados seguros e etapas. Veja [UI-FLOWS.md](docs/UI-FLOWS.md).
- Field aceita mask para cpf/phone/card/postalCode/month/year; funções puras em utils/input-masks.ts preservam cursor e limites. Máscaras não substituem schemas ou validação da API.
- Modais de cadastro usam closeOnBackdrop=false; carrinho mantém o padrão true. busy impede X/Escape/fechamento durante envio.
- Senhas novas exigem mínimo de 12 caracteres Unicode. Não exponha bytes no texto da interface; preserve a proteção técnica do bcrypt e a compatibilidade de login/confirmação com contas antigas.
- Endereços/pedidos pertencem à sessão. Checkout envia address_id salvo, nunca dono ou snapshot de endereço montado pelo cliente.
- Perfil/cartões usam `service/billing.ts` e componentes em `common/billing`; query keys incluem usuário. CPF/PAN/senha só existem no formulário de envio, sem storage/store global. Mutations sensíveis usam gcTime 0 e desmontagem do editor; cache recebe somente máscaras.
- Checkout exige `credit_card_id` próprio e perfil completo. Não crie campo de CVV nem declare cobrança real. Use os schemas e preserve confirmação de senha para cadastrar/excluir cartão ou substituir CPF/telefone.
- Sessão em `src/hooks/useSession.ts`, contratos inferidos dos schemas em `src/types/order.ts`. Queries privadas incluem usuário e são removidas ao trocar de conta.

## Comandos

```bash
npm run dev
npm test
npm run lint
npm run build
```

Antes de concluir uma alteração, execute pelo menos `npm run lint` e `npm run build`.
