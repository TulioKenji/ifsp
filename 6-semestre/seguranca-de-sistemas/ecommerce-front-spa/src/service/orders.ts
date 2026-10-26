import * as v from 'valibot'
import callApi from './callApi'
import { requireSession } from './auth'
import { CreateOrderSchema, OrderSchema, OrdersSchema } from '../schemas/orders'
import type { CreateOrder } from '../types/order'

export async function listOrders(page: number) {
  const result = await callApi<unknown>({ url: `orders?page=${page}&size=10` })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar os pedidos.')
  return v.parse(OrdersSchema, result.data)
}
export async function getOrder(id: string) {
  const result = await callApi<unknown>({ url: `orders/${encodeURIComponent(id)}` })
  if (!result.data) throw new Error(result.error ?? 'Pedido não encontrado.')
  return v.parse(OrderSchema, result.data)
}
export async function createOrder(input: CreateOrder) {
  const body = v.parse(CreateOrderSchema, input)
  await requireSession()
  const result = await callApi<unknown>({ url: 'orders', method: 'POST', body: JSON.stringify(body) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível criar o pedido.')
  return v.parse(OrderSchema, result.data)
}
export async function updateOrder(id: string, addressId: string) {
  v.parse(v.pipe(v.string(), v.uuid()), addressId)
  await requireSession()
  const result = await callApi<unknown>({ url: `orders/${encodeURIComponent(id)}`, method: 'PUT', body: JSON.stringify({ address_id: addressId }) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível atualizar o pedido.')
  return v.parse(OrderSchema, result.data)
}
export async function cancelOrder(id: string) {
  await requireSession()
  const result = await callApi({ url: `orders/${encodeURIComponent(id)}`, method: 'DELETE' })
  if (result.status !== 204) throw new Error(result.error ?? 'Não foi possível cancelar o pedido.')
}
