import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, ShoppingBag, Trash2 } from 'lucide-react'
import * as v from 'valibot'
import { useCart } from '../stores/cart'
import { entryKey } from '../stores/cart-core'
import { useCartModal } from '../stores/cart-modal'
import { AddressBook } from '../components/common/addresses/AddressBook'
import { CardBook } from '../components/common/billing/CardBook'
import { getProfile } from '../service/billing'
import { useSession } from '../hooks/useSession'
import { ErrorMessage, SessionGate } from '../components/common/feedback'
import { Button } from '../components/common/Button'
import { Field, Form } from '../components/common/forms/Form'
import { useForm } from '../hooks/useForm'
import { createOrder } from '../service/orders'
import { fetchCartProducts } from '../service/products'
import { formatMoney } from '../utils/format'

export function CartPage() {
  const cart = useCart()
  const open = useCartModal((s) => s.open)
  const ids = [...new Set(cart.items.map((i) => i.product_id))].sort()
  const products = useQuery({ queryKey: ['cart-products', ids], queryFn: () => fetchCartProducts(ids), enabled: ids.length > 0, retry: false, staleTime: 0 })
  const byId = new Map(products.data?.map((p) => [p.id, p]))
  const cents = cart.items.reduce((sum, i) => sum + Math.round(Number(byId.get(i.product_id)?.price ?? 0) * 100) * i.quantity, 0)
  const valid = products.isSuccess && cart.items.every((item) => {
    const p = byId.get(item.product_id)
    return p && p.active && cart.items.filter((i) => i.product_id === p.id).reduce((n, i) => n + i.quantity, 0) <= p.stock_quantity && Object.keys(p.options).length === Object.keys(item.options).length && Object.entries(p.options).every(([k, values]) => values.includes(item.options[k]))
  })
  return <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-12">
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-700">Sua seleção</p><h1 className="mb-7 text-3xl font-bold">Meu carrinho</h1>
    {cart.items.length === 0 ? <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-5 py-20 text-center"><ShoppingBag className="mx-auto mb-5 text-primary-600" size={44} /><h2 className="text-xl font-bold">Seu próximo upgrade está no catálogo</h2><p className="my-3 text-text-muted">Escolha seus produtos e confirme as opções antes de adicionar.</p><Link to="/" className="action-link mt-4 inline-flex">Explorar produtos →</Link></div> : <>
      {products.isPending && <p role="status" className="mb-4">Conferindo preços e estoque…</p>}<ErrorMessage error={products.error} />
      {products.isError && <Button tone="info" onClick={() => products.refetch()}>Conferir novamente</Button>}
      <div className="mb-7 divide-y divide-border rounded-2xl border border-border bg-surface px-5">{cart.items.map((entry) => {
        const p = byId.get(entry.product_id)
        return <article key={entryKey(entry)} className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="min-w-40 flex-1"><h2 className="font-bold">{p?.name ?? 'Produto não disponível'}</h2><p className="mt-1 text-sm text-text-muted">{Object.entries(entry.options).map(([k, value]) => `${k}: ${value}`).join(' · ') || 'Modelo padrão'} · {entry.quantity} unidade(s)</p>{p && <p className="mt-2 font-bold text-primary-800">{formatMoney(p.price)} <span className="font-normal text-text-muted">por unidade</span></p>}</div>
          <div className="flex gap-2"><Button tone="info" disabled={!p || cart.busy} onClick={() => open({ mode: 'edit', productId: entry.product_id, entry, label: p?.name })}><Pencil size={16} />Editar</Button><Button tone="danger" disabled={cart.busy} aria-label={`Remover ${p?.name ?? 'produto'}`} onClick={() => open({ mode: 'remove', productId: entry.product_id, entry, label: p?.name })}><Trash2 size={16} /></Button></div>
        </article>
      })}</div>
      {!valid && products.isSuccess && <p role="alert" className="mb-5 rounded-xl bg-warning-light p-4 text-warning-dark">Há itens sem estoque ou opções desatualizadas. Edite ou remova esses itens antes de concluir.</p>}
      <div className="mb-7 rounded-2xl bg-primary-50 p-6"><p className="text-sm text-text-secondary">Subtotal estimado</p><p className="mt-1 text-3xl font-bold text-primary-900">{formatMoney(cents / 100)}</p><p className="mt-3 text-sm text-text-secondary">Frete grátis · Até 50 combinações e 100 unidades · Preços conferidos no servidor.</p></div>
      <SessionGate><Checkout ready={valid && !products.isFetching} /></SessionGate>
    </>}
  </div>
}
function Checkout({ ready }: { ready: boolean }) {
  const cart = useCart(), client = useQueryClient(), navigate = useNavigate()
  const session = useSession()
  const profile = useQuery({ queryKey: ['profile', session.data?.id], queryFn: getProfile, gcTime: 0, retry: false })
  const form = useForm({ initial: { address_id: '', credit_card_id: '', coupon_code: '' }, schema: v.object({ address_id: v.pipe(v.string(), v.uuid('Selecione um endereço de entrega.')), credit_card_id: v.pipe(v.string(), v.uuid('Selecione um cartão válido.')), coupon_code: v.pipe(v.string(), v.trim(), v.maxLength(20, 'Use até 20 caracteres.')) }) })
  const checkout = useMutation({ mutationFn: (values: typeof form.values) => createOrder({ ...values, items: cart.items }), retry: false,
    onMutate: () => { cart.setBusy(true) },
    onSettled: () => { cart.setBusy(false) },
    onSuccess: async (order) => { cart.clear(); await client.invalidateQueries({ queryKey: ['orders'] }); await client.invalidateQueries({ queryKey: ['products'] }); await navigate({ to: '/pedidos/$orderId', params: { orderId: order.id } }) },
  })
  return <div id="checkout" className="scroll-mt-64 space-y-6"><ErrorMessage error={profile.error} />{profile.isPending && <p role="status">Conferindo cadastro…</p>}{profile.isError && <Button tone="info" onClick={() => profile.refetch()}>Conferir cadastro novamente</Button>}{profile.data && !profile.data.complete && <p className="rounded-xl bg-warning-light p-5 text-warning-dark">Complete CPF e telefone em <Link to="/conta" className="action-link">Minha conta</Link> antes de comprar.</p>}<AddressBook value={form.values.address_id} onSelect={(id) => form.setValue('address_id', id)} error={form.errors.address_id} /><CardBook value={form.values.credit_card_id} onSelect={(id) => form.setValue('credit_card_id', id)} error={form.errors.credit_card_id} /><Form onSubmit={form.submit((data) => { if (ready && profile.data?.complete && !checkout.isPending) checkout.mutate(data) })} className="rounded-2xl border border-border bg-surface p-6"><div className="max-w-md"><Field {...form.field('coupon_code')} label="Cupom de desconto" placeholder="GREEN10" maxLength={20} disabled={checkout.isPending} /><p className="mt-2 text-sm text-text-muted">GREEN10: 10% de desconto, até R$ 50. Aplicado no total final.</p></div><p className="mt-4 text-sm text-text-muted">Pedido acadêmico, sem cobrança real no cartão selecionado.</p><ErrorMessage error={checkout.error} /><Button type="submit" className="mt-6 w-full sm:w-auto" disabled={!ready || !profile.data?.complete || checkout.isPending}>{checkout.isPending ? 'Criando pedido…' : 'Confirmar pedido'}</Button></Form></div>
}
