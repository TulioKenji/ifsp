import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import * as v from 'valibot'
import { useCartModal, type CartIntent } from './stores/cart-modal'
import { useCart } from './stores/cart'
import { entryKey } from './stores/cart-core'
import { fetchCartProducts } from './service/products'
import { Modal } from './components/common/Modal'
import { Button } from './components/common/Button'
import { Field, Form } from './components/common/forms/Form'
import { useForm } from './hooks/useForm'
import { formatMoney } from './utils/format'

// Um único modal na raiz atende catálogo e /cart; só a intenção é global.
export function CartModal() {
  const { intent, close } = useCartModal()
  const navigate = useNavigate()
  if (!intent) return null
  return <Modal title={intent.mode === 'remove' ? 'Remover do carrinho?' : intent.mode === 'edit' ? 'Editar item' : 'Adicionar ao carrinho'} onClose={close}>
    <CartModalContent key={`${intent.mode}-${intent.productId}-${intent.entry ? entryKey(intent.entry) : ''}`} intent={intent} close={close} onSaved={() => { close(); if (intent.mode === 'add' && intent.afterAdd === 'checkout') void navigate({ to: '/cart', hash: 'checkout' }) }} />
  </Modal>
}

function CartModalContent({ intent, close, onSaved }: { intent: CartIntent; close: () => void; onSaved: () => void }) {
  const cart = useCart()
  const query = useQuery({ queryKey: ['product', intent.productId], queryFn: async () => {
    const products = await fetchCartProducts([intent.productId])
    if (!products[0]) throw new Error('Produto indisponível. Você pode removê-lo do carrinho.')
    return products[0]
  }, enabled: intent.mode !== 'remove', retry: false, staleTime: 0 })
  if (cart.busy) return <p role="status" className="text-text-secondary">Aguarde a confirmação do pedido para alterar o carrinho.</p>
  if (intent.mode === 'remove' && intent.entry) return <>
    <p className="text-text-secondary">Deseja remover <strong className="text-text-primary">{intent.label ?? 'este produto'}</strong>? A alteração só será feita após confirmar.</p>
    <div className="mt-6 flex justify-end gap-3"><Button tone="neutral" onClick={close}>Manter item</Button><Button tone="danger" onClick={() => { cart.remove(entryKey(intent.entry!)); close() }}>Remover item</Button></div>
  </>
  if (query.isPending || query.isFetching) return <p role="status" className="py-8 text-center text-text-muted">Conferindo produto e opções…</p>
  if (query.isError) return <><p role="alert" className="text-danger-dark">{query.error.message}</p><Button className="mt-4" tone="info" onClick={() => query.refetch()}>Tentar novamente</Button></>
  return <ProductOptions key={JSON.stringify(query.data.options)} product={query.data} intent={intent} close={close} onSaved={onSaved} />
}

function ProductOptions({ product, intent, close, onSaved }: { product: Product; intent: CartIntent; close: () => void; onSaved: () => void }) {
  const cart = useCart()
  const [error, setError] = useState('')
  const previousKey = intent.entry ? entryKey(intent.entry) : undefined
  const others = cart.items.filter((i) => entryKey(i) !== previousKey)
  const available = Math.min(100 - others.reduce((n, i) => n + i.quantity, 0), product.stock_quantity - others.filter((i) => i.product_id === product.id).reduce((n, i) => n + i.quantity, 0))
  const options = Object.fromEntries(Object.entries(product.options).map(([key, values]) => [key, intent.entry?.options[key] ?? values[0] ?? '']))
  const schema = v.object({
    quantity: v.pipe(v.string(), v.regex(/^[1-9]\d{0,2}$/, 'Informe uma quantidade inteira.'), v.check((n) => Number(n) <= available, `Quantidade disponível: ${Math.max(0, available)}.`)),
    options: v.object(Object.fromEntries(Object.entries(product.options).map(([key, values]) => [key, v.pipe(v.string(), v.check((s) => values.includes(s), 'Selecione uma opção válida.'))]))),
  })
  const form = useForm({ initial: { quantity: String(intent.entry?.quantity ?? 1), options }, schema })
  return <Form onSubmit={form.submit((data) => {
    const message = cart.save({ product_id: product.id, quantity: Number(data.quantity), options: data.options }, previousKey)
    if (message) setError(message); else onSaved()
  })}>
    <p className="text-lg font-bold">{product.name}</p><p className="mb-6 mt-1 text-primary-800">{formatMoney(product.price)} por unidade</p>
    <div className="grid gap-5 sm:grid-cols-2"><Field {...form.field('quantity')} label="Quantidade" required type="number" inputMode="numeric" min={1} max={Math.max(1, available)} />
      {Object.entries(product.options).map(([key, values]) => <Field key={key} {...form.field(`options.${key}`)} label={key.charAt(0).toUpperCase() + key.slice(1)} required options={values.map((value) => ({ value, label: value }))} />)}
    </div>
    {Object.keys(product.options).length === 0 && <p className="mt-4 text-sm text-text-muted">Este produto não possui variações cadastradas.</p>}
    <p className="mt-5 text-xs text-text-muted">Limite de 100 unidades no carrinho. Preço e estoque serão conferidos novamente no checkout.</p>
    {error && <p role="alert" className="mt-3 text-sm font-medium text-danger-dark">{error}</p>}
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button tone="neutral" onClick={close}>Cancelar</Button><Button type="submit" disabled={available < 1}>{intent.mode === 'edit' ? 'Salvar alterações' : intent.mode === 'add' && intent.afterAdd === 'checkout' ? 'Adicionar e ir para compra' : 'Confirmar adição'}</Button></div>
  </Form>
}
