import * as v from 'valibot'
import { AddressSchema, SavedAddressSchema } from '../schemas/orders'
import type { Address } from '../types/order'
import callApi from './callApi'
import { requireSession } from './auth'

export async function listAddresses() {
  const result = await callApi<unknown>({ url: 'addresses' })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar os endereços.')
  return v.parse(v.pipe(v.array(SavedAddressSchema), v.maxLength(20)), result.data)
}
export async function saveAddress(address: Address, id?: string) {
  const body = v.parse(AddressSchema, address)
  await requireSession()
  const result = await callApi<unknown>({ url: id ? `addresses/${encodeURIComponent(id)}` : 'addresses', method: id ? 'PUT' : 'POST', body: JSON.stringify(body) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível salvar o endereço.')
  return v.parse(SavedAddressSchema, result.data)
}
export async function deleteAddress(id: string) {
  await requireSession()
  const result = await callApi({ url: `addresses/${encodeURIComponent(id)}`, method: 'DELETE' })
  if (result.status !== 204) throw new Error(result.error ?? 'Não foi possível remover o endereço.')
}
