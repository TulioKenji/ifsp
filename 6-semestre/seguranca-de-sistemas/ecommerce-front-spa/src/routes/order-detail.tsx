import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrder, updateOrder, cancelOrder } from '../service/orders'
import { useSession } from '../hooks/useSession'
import { SessionGate, ErrorMessage } from '../components/common/feedback'
import { AddressBook } from '../components/common/addresses/AddressBook'
import { OrderStatus } from '../components/common/orders/OrderStatus'
import { Modal } from '../components/common/Modal'
import { Button } from '../components/common/Button'
import { formatDate, formatMoney } from '../utils/format'

export function OrderDetailPage() {
  return <div className="mx-auto w-full max-w-4xl px-5 py-12"><Link to="/pedidos" className="action-link">← Meus pedidos</Link><SessionGate><OrderDetail /></SessionGate></div>
}
function OrderDetail() {
  const { orderId } = useParams({ from: '/pedidos/$orderId' })
  const session = useSession(), client = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [addressId, setAddressId] = useState('')
  const query = useQuery({ queryKey: ['orders', session.data?.id, orderId], queryFn: () => getOrder(orderId), retry: false })
  const refresh = async () => { await client.invalidateQueries({ queryKey: ['orders'] }); await client.invalidateQueries({ queryKey: ['products'] }); await client.invalidateQueries({ queryKey: ['cart-products'] }) }
  const update = useMutation({ mutationFn: (id: string) => updateOrder(orderId, id), onSuccess: refresh })
  const cancel = useMutation({ mutationFn: () => cancelOrder(orderId), onSuccess: async () => { setConfirmCancel(false); await refresh() } })
  const order = query.data
  const pending = update.isPending || cancel.isPending
  if (query.isPending) return <p role="status" className="mt-6">Carregando pedido…</p>
  if (!order) return <><ErrorMessage error={query.error} /><Button tone="info" onClick={() => query.refetch()}>Tentar novamente</Button></>
  return <>
    <h1 className="mt-6 break-all text-2xl font-bold">Pedido {order.id}</h1><div className="my-3 flex flex-wrap items-center gap-3"><p className="text-text-secondary">{formatDate(order.created_at)}</p><OrderStatus status={order.status} /></div>
    <ErrorMessage error={query.error} />
    <section className="mt-6 rounded-2xl border border-border bg-surface p-6"><h2 className="mb-2 text-xl font-bold">Cartão vinculado</h2><p>{order.credit_card_id ? `${order.card_brand} •••• ${order.card_last4}` : 'Pedido anterior ao cadastro de cartões.'}</p><p className="mt-2 text-sm text-text-muted">Referência acadêmica. Não representa autorização bancária nem cobrança.</p></section>
    <section className="my-6 rounded-2xl border border-border bg-surface p-6"><h2 className="mb-4 text-xl font-bold">Itens</h2>
      <ul className="divide-y divide-border">{order.items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-3"><span>{item.quantity} × {item.product_name}<small className="block text-text-muted">{Object.entries(item.options).map(([k, value]) => `${k}: ${value}`).join(' · ')}</small><small className="block text-text-muted">{formatMoney(item.unit_price)} por unidade</small></span><strong className="shrink-0">{formatMoney(item.total_price)}</strong></li>)}</ul>
      <dl className="mt-4 space-y-2 border-t border-border pt-4"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Frete</dt><dd>{formatMoney(order.shipping_cost)}</dd></div><div className="flex justify-between"><dt>Desconto {order.coupon_code && `(${order.coupon_code})`}</dt><dd>− {formatMoney(order.discount)}</dd></div><div className="flex justify-between text-xl font-bold"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div></dl>
    </section>
    <section className="mb-6 rounded-2xl border border-border bg-surface p-6"><h2 className="mb-3 text-xl font-bold">Entrega registrada neste pedido</h2><p>{order.shipping_address.recipient_name}</p><p className="break-words">{order.shipping_address.street}, {order.shipping_address.number} {order.shipping_address.complement}</p><p>{order.shipping_address.neighborhood} · {order.shipping_address.city} / {order.shipping_address.state}</p><p>{order.shipping_address.postal_code} · {order.shipping_address.country}</p></section>
    <ErrorMessage error={update.error ?? cancel.error} />
    {update.isSuccess && <p role="status" className="mb-4 text-success-dark">Endereço do pedido atualizado.</p>}
    {order.status === 'pending' && <>
      <AddressBook value={addressId || order.address_id} onSelect={setAddressId} />
      <Button className="mt-4" tone="info" disabled={pending || !addressId} onClick={() => update.mutate(addressId)}>Usar endereço selecionado neste pedido</Button>
      <section className="mt-8 rounded-2xl border border-danger/30 bg-danger-light/30 p-5"><h2 className="font-bold text-danger-dark">Cancelar pedido</h2><p className="my-3 text-text-secondary">O cancelamento devolve os itens ao estoque e mantém o histórico do pedido.</p><Button tone="danger" disabled={pending} onClick={() => { cancel.reset(); setConfirmCancel(true) }}>Cancelar pedido</Button></section>
    </>}
    {confirmCancel && <Modal title="Cancelar este pedido?" onClose={() => { if (!pending) setConfirmCancel(false) }}><p>Os produtos voltarão ao estoque. Esta ação não pode ser desfeita.</p><ErrorMessage error={cancel.error} /><div className="mt-6 flex justify-end gap-3"><Button tone="neutral" disabled={pending} onClick={() => setConfirmCancel(false)}>Manter pedido</Button><Button tone="danger" disabled={pending} onClick={() => cancel.mutate()}>{cancel.isPending ? 'Cancelando…' : 'Confirmar cancelamento'}</Button></div></Modal>}
  </>
}
