# Contrato HTTP

Base `/api`. JSON estrito (`Content-Type: application/json`), até 64 KiB: campos desconhecidos e documentos adicionais são rejeitados. Texto não aceita NUL, controles ou UTF-8 inválido. Erros: `{ "error": "mensagem" }`. O runtime não executa migrations; antes de atualizar o servidor, execute `go run ./cmd/dbsetup`.

| Método e caminho | Acesso | Resultado |
| --- | --- | --- |
| GET `/products?page=1&size=20&field=all&queryparam=ssd` | Público | Produtos ativos, com `options` e imagem |
| GET `/products?ids=uuid1,uuid2&size=50` | Público | Consulta limitada a 50 UUIDs para conferir o carrinho |
| GET `/products/{id}` | Público | Produto ativo com imagens |
| POST `/auth/register` | Público, limitado | 201 sem corpo |
| POST `/auth/login` | Público, limitado | 200, cookie e identidade com CSRF |
| GET `/auth/session` | Sessão | 200, identidade com CSRF |
| POST `/auth/logout` | Sessão + CSRF | 204, revoga sessão/remove cookie |
| GET `/profile` | Sessão + transporte seguro | Perfil com CPF/telefone mascarados |
| PUT `/profile` | Sessão + CSRF + senha atual | Substitui CPF/telefone próprios |
| GET `/cards` | Sessão + transporte seguro | Até 10 cartões mascarados do usuário |
| POST `/cards` | Sessão + CSRF + senha atual | 201, cadastra cartão |
| DELETE `/cards/{id}` | Sessão + CSRF + senha atual | 204, arquiva e limpa dados criptografados |
| GET `/addresses` | Sessão | Array de até 20 endereços ativos do usuário |
| POST `/addresses` | Sessão + CSRF | 201, endereço salvo com ID e datas |
| PUT `/addresses/{id}` | Sessão + CSRF | 200, edita endereço próprio e ativo |
| DELETE `/addresses/{id}` | Sessão + CSRF | 204, arquiva endereço e preserva pedidos |
| POST `/orders` | Sessão + CSRF | 201, pedido completo e Location |
| GET `/orders?page=1&size=10` | Sessão | Resumos de pedidos do cliente |
| GET `/orders/{id}` | Sessão | Pedido e itens |
| PUT `/orders/{id}` | Sessão + CSRF | Troca endereço de pedido pendente |
| DELETE `/orders/{id}` | Sessão + CSRF | 204, cancela pendente e devolve estoque |

Autenticação recebe `email`, `password` e opcionalmente `name`. Cadastro exige pelo menos **12 caracteres Unicode**, contados por code point, e sempre cria customer. O limite interno do bcrypt continua em 72 bytes UTF-8, sem truncamento; a interface comunica excesso como senha muito longa, sem prometer equivalência em caracteres. Login/confirmação aceitam senhas legadas para não bloquear contas anteriores à política nova. Login retorna `{id,email,name,csrf_token}` e cookie session_token HttpOnly, SameSite=Lax, Secure em produção. Consulte `/auth/session` após reload e envie X-CSRF-Token nas escritas privadas. Tokens nunca ficam no localStorage.

## Endereços

POST/PUT `/addresses` recebem os campos abaixo; PUT usa também o ID na URL. Só complemento pode ser vazio. O usuário vem da sessão e não é aceito no JSON.

```json
{
  "recipient_name": "Ana", "postal_code": "12345-678", "street": "Rua Exemplo",
  "number": "10", "complement": "", "neighborhood": "Centro",
  "city": "São Paulo", "state": "SP", "country": "BR"
}
```

Limites em caracteres: destinatário 150; CEP/número 20; rua 200; demais campos 100. Cada usuário pode manter 20 endereços ativos, inclusive sob criação concorrente. Exclusão é arquivamento: referências e snapshots dos pedidos continuam válidos, mas o endereço arquivado não pode ser usado em nova compra. Editar a agenda não muda pedidos existentes. Trocar a entrega de um pedido requer PUT explícito no pedido.

## Pedidos e opções

```json
{
  "address_id": "00000000-0000-0000-0000-000000000002",
  "credit_card_id": "00000000-0000-0000-0000-000000000003",
  "coupon_code": "GREEN10",
  "items": [{
    "product_id": "00000000-0000-0000-0000-000000000001",
    "quantity": 2,
    "options": {"tamanho":"M","cor":"Verde"}
  }]
}
```

UUIDs são ilustrativos: use produto e endereço reais. `address_id` é obrigatório e deve pertencer à sessão. O banco também impõe uma FK composta `(address_id,user_id)`. O cliente não envia endereço avulso, preço, total, desconto, dono ou status. PUT recebe somente `{ "address_id": "uuid" }`.

Nova compra também exige perfil com CPF/telefone e `credit_card_id` próprio, ativo e não expirado, protegido por FK composta. O detalhe/lista inclui `credit_card_id`, `card_brand` e `card_last4`; pedidos legados têm ID null e máscaras vazias. Não há cobrança real e não se altera cartão de pedido já criado. Veja [SENSITIVE-DATA.md](SENSITIVE-DATA.md) para tabelas, chaves, contratos completos e limitações.

PUT `/profile` recebe `{ "cpf":"529.982.247-25", "phone":"(11) 99999-9999", "current_password":"sua-senha-atual" }`. GET retorna `{ "complete":true, "cpf_masked":"***.***.***-25", "phone_masked":"+55 (**) *****-9999" }`; cadastro incompleto usa false e strings vazias. Valores de exemplo são destinados a testes; a validação de dígitos não comprova identidade.

POST `/cards` recebe `{ "number":"4242424242424242", "holder_name":"ALUNO TESTE", "exp_month":12, "exp_year":2030, "current_password":"sua-senha-atual" }`. A validade precisa estar no mês atual ou futuro (UTC), até 15 anos à frente. Respostas incluem somente `{id,brand,last4,exp_month,exp_year,created_at}`. DELETE exige corpo JSON `{ "current_password":"sua-senha-atual" }`. CPF/telefone, número e titular não são retornados completos. CVV é campo desconhecido e é rejeitado. Cartões são imutáveis: para substituir dados, cadastre outro e exclua o anterior.

Perfil/cartões exigem HTTPS. HTTP só é permitido em desenvolvimento com cliente loopback; `PRODUCTION=1` exige TLS inclusive em loopback. Headers de proxy não contornam essa verificação. A topologia suportada é TLS no próprio Go. Escritas sensíveis compartilham 10 requests/min/IP e duas execuções simultâneas, além dos limites gerais.

Limites: 1..50 combinações distintas de produto/opções, quantidade inteira 1..100 e **até 100 unidades somadas**. Combinações repetidas são rejeitadas, mesmo com chaves em outra ordem. Um produto pode aparecer em linhas distintas com tamanhos diferentes. As opções devem coincidir exatamente com as opções do produto no banco.

`products.options` é um objeto como `{"tamanho":["M","G"],"cor":["Preto","Verde"]}`. Contrato: até 4 chaves, nomes ASCII minúsculos (`^[a-z][a-z0-9_]{0,19}$`), sem `constructor`/`prototype`; cada chave tem 1..8 escolhas não vazias de até 40 caracteres. Sem opções: `{}`. Produtos `TEC-0001`, `TEC-0003`, `PAD-0001` e `PAD-0002` têm exemplos no seed. As variações compartilham preço e estoque do produto; inventário por SKU de variação exige um modelo futuro separado.

`coupon_code` é opcional. `GREEN10` concede 10% do subtotal, limitado a R$ 50 por pedido; é normalizado para maiúsculas e calculado com NUMERIC no servidor. Cupom desconhecido é rejeitado. Frete continua zero nesta versão.

Resposta completa: `id`, `address_id`, `coupon_code` (vazio se ausente), `status`, `subtotal`, `shipping_cost`, `discount`, `total`, `currency`, `shipping_address`, `items`, `created_at`, `updated_at`. Dinheiro é string decimal (`"39.80"`), moeda BRL. `shipping_address` é a cópia histórica da entrega. Itens incluem snapshots de nome, SKU, preço e `options`, além de quantidade e total.

Lista retorna `{ "pagination": {"page":1,"size":10,"total":1,"total_pages":1}, "data": [...] }`. Paginação: page 1..10000, size 1..100. Resumos de pedidos têm `items: []`; consulte o detalhe para itens. Cancelar preserva histórico; segunda tentativa retorna 409 sem duplicar estoque. Não há retry automático de compra: em falha de rede incerta, consulte os pedidos antes de repetir.

## Códigos e origens

UUID/input inválido: 400; sessão inválida: 401; CSRF/origem inválida: 403; recurso ausente/alheio/arquivado: 404; estoque/estado incompatível: 409; corpo grande: 413; mídia: 415; taxa: 429; sobrecarga: 503. Métodos inválidos: 405 nas rotas existentes. Excesso de sockets pode resultar em reset/EOF antes do HTTP. Streaming HTTP/1 chunked não é suportado.

Senha atual incorreta ou lockout na reautenticação: 403. Cartão ativo duplicado: 409. Cartão expirado/arquivado/alheio na compra: 404. Transporte inseguro em perfil/cartões: 426. Novo pedido sem perfil completo ou sem cartão: 400.

Qualquer origem pode ler catálogo sem cookies. Escritas de navegador e credenciais entre origens exigem origem confiável. CORS não substitui sessão ou autorização. O fluxo do SPA é mesma origem; SameSite=Lax restringe cookies entre sites diferentes. Clientes como curl precisam guardar cookie e enviar CSRF.
