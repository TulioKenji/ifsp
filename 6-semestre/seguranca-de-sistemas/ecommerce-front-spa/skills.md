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

`src/App.tsx` compõe StoreHeader, Outlet e o modal global. `components/common/layout/StoreHeader.tsx` contém logo, busca funcional, atalhos por termo, conta, pedidos, contador do carrinho e cupons. A busca fica em `/?q=...`, validada pelo router, preservando reload e Voltar. O shell não contém requests de catálogo.

### Rotas

`src/routes/router.tsx` declara `/` (carrossel/catálogo e busca q), `/produtos/$productId`, `/conta`, `/cart`, `/pedidos` e `/pedidos/$orderId`; `/carrinho` redireciona para `/cart`. As páginas usam lazyRouteComponent/import(), gerando chunks. O router só compõe navegação e valida busca; markup e chamadas de domínio ficam nas páginas/serviços.

Quando novas telas forem criadas, cada tela deve ter seu módulo em `src/routes/<nome>.tsx` e ser registrada no router. O router deve cuidar de composição e navegação, não de chamadas HTTP ou markup de produto.

### Produtos

`src/components/common/products/card.tsx` apresenta SKU, nome, descrição, preço, estoque e imagem. A imagem é delegada a `ProductImage`, mantendo o card livre da lógica de fallback.

Um Link estendido cobre o card fora do botão de carrinho, sem aninhar botão em âncora. `/produtos/$productId` usa fetchProduct/ProductDetailSchema para o endpoint existente GET `/api/products/{id}`: galeria, descrição completa, SKU, opções e estoque. Comprar agora abre o modal com afterAdd=checkout; somente a confirmação bem-sucedida acrescenta o item e navega ao cart, mantendo os anteriores. Cancelar não adiciona nem navega.

`src/components/common/image/index.tsx` é o componente genérico `Image`. Ele encapsula o erro de carregamento e retorna um ícone `ImageOff` do Lucide, salvo quando recebe um fallback customizado.

`src/components/common/image/products.tsx` é a variação de domínio. Ela usa `product.url` e fornece `no-image-product.png` como fallback.

### API e services

`src/service/callApi.ts` é a fronteira HTTP. Ele recebe uma URL relativa, prefixa `/api/`, envia cookies na mesma origem e CSRF em escritas, normaliza JSON, erros e respostas 204 e retorna:

```ts
{
  status: number
  data: T | null
  error?: string
}
```

Páginas e componentes não devem chamar `fetch` diretamente. Serviços de domínio validam entrada e resposta com Valibot. `service/products.ts` concentra a listagem; `service/auth.ts` controla sessão; `service/orders.ts` implementa CRUD de pedidos.

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
input controlado do header
  -> catalogSearch
  -> parâmetro q na URL
  -> queryKey ['products', q]
  -> useInfiniteQuery
  -> service/products.ts + ProductQueryParamsRequestSchema
  -> callApi({url: 'products?...'})
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

## Fluxo de conta e pedido

1. `/conta` valida credenciais e usa `authenticate`; cadastro cria a conta e em seguida faz login.
2. O cookie HttpOnly é gerenciado pelo navegador; a resposta de login/sessão fornece CSRF, armazenado somente em memória por `callApi`.
3. `SessionGate` consulta `useSession` e exibe login quando necessário. A API continua responsável pela autorização real.
4. `ProductCard` e `/cart` abrem `src/CartModal.tsx` via Zustand. Confirmar inclusão/edição/exclusão altera `stores/cart-core.ts`; persistência limita IDs/opções/quantidades antes de ler/gravar localStorage. Cart Context foi removido.
5. `AddressForm` usa `Form`/`Field`/`useForm` para validar duas etapas sem validação nativa. `AddressBook` controla a agenda da sessão. Veja [UI-FLOWS.md](docs/UI-FLOWS.md) para criar formulários com arrays e múltiplas páginas.
6. Checkout chama `createOrder` com endereço salvo, itens/opções e cupom opcional. Bloqueia alterações no carrinho durante envio, invalida catálogo/pedidos e navega ao detalhe. O cliente não envia preço, frete, status ou dono.
7. `/pedidos` pagina resumos. Detalhe carrega itens, permite atualizar endereço e pede confirmação visual antes de cancelar pendente.
8. Logout revoga a sessão no servidor, remove cache privado e limpa carrinho. Não repita POST automaticamente; em falha de rede incerta consulte pedidos.

Tipos de pedido/endereço são inferidos dos schemas Valibot para evitar contratos divergentes. `utils/format.ts` formata moeda/data/status. O backend calcula dinheiro com NUMERIC, enquanto o carrinho mostra somente uma estimativa. Veja as regras completas em [API.md](../ecommerce-api-go/docs/API.md) e [ARCHITECTURE.md](../ecommerce-api-go/docs/ARCHITECTURE.md).

## Perfil sensível e cartões

`ProfilePanel`/`CardBook` usam os campos/forms compartilhados, `schemas/billing.ts`, tipos inferidos e `service/billing.ts`. As queries privadas são por usuário; forms e mutations sensíveis são transitórios (gcTime 0 e desmontagem). Nunca adicione CPF, telefone, PAN, senha ou cartão selecionado ao carrinho persistido. Checkout envia credit_card_id e exige perfil completo; não expõe cobrança real. Preserve senha atual para editar perfil/cadastrar/excluir cartão e nunca adicione CVV. Logout remove também caches cards/profile. Leia [SENSITIVE-DATA.md](../ecommerce-api-go/docs/SENSITIVE-DATA.md).

## Máscaras, senhas e modais

Field aceita `mask="cpf"`, `phone`, `card`, `postalCode`, `month` e `year`. O adaptador em utils/input-masks.ts aplica pontuação/espaços, limita tamanho e mantém a posição por contagem de dígitos; Backspace/Delete junto ao separador remove o dígito adjacente. Cartão Amex usa grupos 4-6-5; demais até 19 dígitos. Telefone admite +55 e CEP usa máscara somente com país BR. O valor formatado é validado e enviado pelo serviço; a API normaliza sem alterar chaves de criptografia ou fingerprints.

Cadastros de endereço/perfil/cartão usam `<Modal closeOnBackdrop={false}>`. X e Escape continuam disponíveis quando não há envio; busy bloqueia fechamento durante a mutation. Carrinho e confirmações sem formulário mantêm clique fora. Máscaras e fechamento são opções do componente compartilhado, não regras duplicadas por página.

Senhas novas exigem pelo menos 12 caracteres Unicode; login e confirmação aceitam senhas legadas. schemas/password.ts compartilha mensagens em caracteres e a verificação técnica de capacidade do hash, sem truncar. Não prometa máximo em caracteres equivalente ao limite interno em bytes do bcrypt.
