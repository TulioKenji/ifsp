import * as v from 'valibot'
import { CredentialsSchema, RegistrationCredentialsSchema, SessionSchema } from '../schemas/auth'
import callApi, { setCSRFToken } from './callApi'

export async function getSession() {
  const res = await callApi<unknown>({ url: 'auth/session' })
  if (res.status === 401) { setCSRFToken(); return null }
  if (!res.data) throw new Error(res.error ?? 'Não foi possível consultar a sessão.')
  const session = v.parse(SessionSchema, res.data)
  setCSRFToken(session.csrf_token)
  return session
}

export async function authenticate(input: v.InferInput<typeof CredentialsSchema>, register: boolean) {
  const body = v.parse(register ? RegistrationCredentialsSchema : CredentialsSchema, input)
  if (register) {
    const created = await callApi({ url: 'auth/register', method: 'POST', body: JSON.stringify(body) })
    if (created.status !== 201) throw new Error(created.error ?? 'Não foi possível criar sua conta.')
  }
  const result = await callApi<unknown>({ url: 'auth/login', method: 'POST', body: JSON.stringify(body) })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível entrar.')
  const session = v.parse(SessionSchema, result.data)
  setCSRFToken(session.csrf_token)
  return session
}

export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('Entre na sua conta para continuar.')
  return session
}

export async function logout() {
  await requireSession()
  const res = await callApi({ url: 'auth/logout', method: 'POST' })
  if (res.status !== 204) throw new Error(res.error ?? 'Não foi possível sair.')
  setCSRFToken()
}
