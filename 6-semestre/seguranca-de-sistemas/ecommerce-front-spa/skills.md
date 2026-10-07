# GreenStore Skills and Architecture

## Stack

| Tecnologia | Responsabilidade |
| --- | --- |
| React 19 | Componentes e estado da interface |
| TypeScript | Tipagem dos contratos e componentes |
| Vite | Desenvolvimento e build |
| TanStack Router | Roteamento da SPA |
| TanStack Query | Cache, fetching e paginação infinita |
| Tailwind CSS | Estilização utilitária |
| Valibot | Validação de formulários, requests e responses |
| Lucide React | Ícones da interface |

## Módulos

### Entrada e providers

`src/main.tsx` cria o `QueryClient`, instala o `QueryClientProvider` e inicia o `RouterProvider`. O `QueryClient` é a instância compartilhada de cache da aplicação.

### Shell da aplicação

`src/App.tsx` renderiza o header da GreenStore e o `Outlet`. O shell não deve conter regras específicas do catálogo; conteúdo de páginas deve permanecer em `src/routes`.

### Rotas

`src/routes/router.tsx` declara a rota raiz e associa `/` a `ProductsPage`. `src/routes/index.tsx` contém a implementação da página do catálogo.

Quando novas telas forem criadas, cada tela deve ter seu módulo em `src/routes/<nome>.tsx` e ser registrada no router. O router deve cuidar de composição e navegação, não de chamadas HTTP ou markup de produto.

### Produtos

`src/components/common/products/card.tsx` apresenta SKU, nome, descrição, preço, estoque e imagem. A imagem é delegada a `ProductImage`, mantendo o card livre da lógica de fallback.

`src/components/common/image/index.tsx` é o componente genérico `Image`. Ele encapsula o erro de carregamento e retorna um ícone `ImageOff` do Lucide, salvo quando recebe um fallback customizado.

`src/components/common/image/products.tsx` é a variação de domínio. Ela usa `product.url` e fornece `no-image-product.png` como fallback.

### API e services

`src/service/callApi.ts` é a fronteira HTTP. Ele recebe uma URL relativa, prefixa a base `http://localhost:8080/`, executa a requisição e retorna:

```ts
{
  status: number
  data: T | null
  error?: string
}
```

Páginas e componentes não devem chamar `fetch` diretamente. A página deve validar a entrada antes de montar a URL e validar a resposta depois de recebê-la.

### Schemas e utils

`src/schemas/products.ts` contém:

- `ProductQueryParamsRequestSchema`: valida página, tamanho, campo e termo.
- `ProductSearchSchema`: valida o input de busca.
- `ProductResponseSchema`: valida paginação e produtos retornados.

`src/utils/parseForm.ts` transforma problemas do Valibot em um mapa de erros por campo. Use essa função para validações de formulário simples e controlados.

### Estilos e assets

`src/style/colors.ts` é a fonte da identidade visual. `tailwind.config.ts` expõe esses tokens para as classes Tailwind, incluindo `primary`, `hulk`, `background`, `surface`, `text`, `border` e estados.

Os assets de marca ficam em `src/assets`: `logo-full.png`, `logo-transparent.png` e `no-image-product.png`.

## Fluxo do catálogo

```text
input controlado
  -> ProductSearchSchema + parseForm
  -> estado search
  -> queryKey ['products', search]
  -> useInfiniteQuery
  -> ProductQueryParamsRequestSchema
  -> callApi('products?...')
  -> ProductResponseSchema
  -> páginas achatadas
  -> ProductCard
  -> ProductImage
```

A próxima página é calculada por `pagination.page` e `pagination.total_pages`. O botão `Carregar mais` chama `fetchNextPage` e fica desabilitado enquanto a página está sendo carregada.

## Padrões de evolução

- Extraia componentes quando a marcação ou regra aparecer em mais de uma tela.
- Mantenha validação próxima do boundary: entrada antes da API e resposta depois da API.
- Não misture contratos de API com componentes visuais.
- Preserve acessibilidade em imagens, botões e estados de erro.
- Após mudanças, rode `npm run lint` e `npm run build`.
