import * as v from 'valibot'
import { CurrentPasswordSchema, NewPasswordSchema } from './password.ts'

export const CredentialsSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Informe um email válido.'), v.maxLength(320)),
  password: CurrentPasswordSchema,
  name: v.pipe(v.string(), v.trim(), v.maxLength(150)),
})
export const RegistrationCredentialsSchema = v.object({ ...CredentialsSchema.entries, password: NewPasswordSchema, name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Informe seu nome.'), v.maxLength(150)) })
export const SessionSchema = v.object({ id: v.string(), name: v.string(), email: v.string(), csrf_token: v.string() })
