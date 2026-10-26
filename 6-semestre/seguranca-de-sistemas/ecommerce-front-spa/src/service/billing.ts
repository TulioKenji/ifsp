import * as v from 'valibot'
import callApi from './callApi'
import { requireSession } from './auth'
import { ProfileSchema, ProfileInputSchema, CardSchema, CardFormSchema, PasswordSchema, type CardFormValues, type ProfileInput } from '../schemas/billing'

// Só máscaras saem da API; números completos existem apenas no envio transitório.
export async function getProfile() {
  const result = await callApi<unknown>({ url: 'profile' })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar seu perfil.')
  return v.parse(ProfileSchema, result.data)
}
export async function saveProfile(input: ProfileInput) {
  const body = v.parse(ProfileInputSchema, input)
  await requireSession()
  const result = await callApi<unknown>({ url: 'profile', method: 'PUT', body: JSON.stringify(body) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível salvar seu perfil.')
  return v.parse(ProfileSchema, result.data)
}
export async function listCards() {
  const result = await callApi<unknown>({ url: 'cards' })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar os cartões.')
  return v.parse(v.pipe(v.array(CardSchema), v.maxLength(10)), result.data)
}
export async function addCard(input: CardFormValues) {
  const values = v.parse(CardFormSchema, input)
  await requireSession()
  const result = await callApi<unknown>({ url: 'cards', method: 'POST', body: JSON.stringify({ ...values, exp_month: Number(values.exp_month), exp_year: Number(values.exp_year) }) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível cadastrar o cartão.')
  return v.parse(CardSchema, result.data)
}
export async function removeCard(id: string, current_password: string) {
  const body = v.parse(PasswordSchema, { current_password })
  await requireSession()
  const result = await callApi({ url: `cards/${encodeURIComponent(id)}`, method: 'DELETE', body: JSON.stringify(body) })
  if (result.status !== 204) throw new Error(result.error ?? 'Não foi possível excluir o cartão.')
}
