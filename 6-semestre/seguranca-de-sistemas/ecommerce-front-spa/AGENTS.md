# GreenStore Agent Guide

## Contexto

GreenStore é uma SPA de ecommerce construída com React e TypeScript. A aplicação consome uma API Go em `http://localhost:8080` e apresenta o catálogo de produtos na rota `/`.

## Arquitetura

A aplicação segue uma separação simples por responsabilidade:

- `src/main.tsx`: ponto de entrada e composição dos providers.
- `src/App.tsx`: shell visual compartilhado, header e `Outlet` do TanStack Router.
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
3. `ProductsPage` controla `inputValue` e `search` com React state.
4. `useInfiniteQuery` chama `fetchProducts` por página.
5. `fetchProducts` valida os parâmetros com `ProductQueryParamsRequestSchema`.
6. `callApi` executa a requisição HTTP e normaliza erros de transporte.
7. A resposta é validada com `ProductResponseSchema`.
8. Os produtos são renderizados por `ProductCard`.
9. `ProductImage` usa a URL do produto e cai para `no-image-product.png` quando necessário.

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

## Comandos

```bash
npm run dev
npm run lint
npm run build
```

Antes de concluir uma alteração, execute pelo menos `npm run lint` e `npm run build`.
