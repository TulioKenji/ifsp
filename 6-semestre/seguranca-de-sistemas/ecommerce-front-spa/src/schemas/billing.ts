import * as v from 'valibot'
import { cpfDigits, phoneDigits, cardBrand, cardExpired } from '../utils/personal.ts'
import { CurrentPasswordSchema } from './password.ts'

const password = CurrentPasswordSchema
export const PasswordSchema = v.object({ current_password: password })
export const ProfileSchema = v.strictObject({ complete: v.boolean(), cpf_masked: v.string(), phone_masked: v.string() })
export const ProfileInputSchema = v.strictObject({
  cpf: v.pipe(v.string(), v.check((s) => !!cpfDigits(s), 'Informe um CPF válido.')),
  phone: v.pipe(v.string(), v.check((s) => !!phoneDigits(s), 'Informe DDD e telefone brasileiro válido.')),
  current_password: password,
})
export const CardSchema = v.strictObject({ id: v.pipe(v.string(), v.uuid()), brand: v.picklist(['Visa', 'Mastercard', 'Amex']), last4: v.pipe(v.string(), v.regex(/^\d{4}$/)), exp_month: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(12)), exp_year: v.pipe(v.number(), v.integer()), created_at: v.string() })
export const CardFormSchema = v.pipe(v.strictObject({
  number: v.pipe(v.string(), v.check((s) => !!cardBrand(s), 'Informe um cartão Visa, Mastercard ou Amex válido.')),
  holder_name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Informe o titular.'), v.maxLength(150), v.check((s) => Array.from(s).every((c) => c.charCodeAt(0) >= 32 && (c.charCodeAt(0) < 127 || c.charCodeAt(0) > 159)), 'Remova caracteres de controle.')),
  exp_month: v.pipe(v.string(), v.regex(/^(0?[1-9]|1[0-2])$/, 'Use um mês de 1 a 12.')),
  exp_year: v.pipe(v.string(), v.regex(/^\d{4}$/, 'Informe o ano com 4 dígitos.')),
  current_password: password,
}), v.forward(v.check((s) => !cardExpired(Number(s.exp_month), Number(s.exp_year)) && Number(s.exp_year) <= new Date().getUTCFullYear() + 15, 'Validade expirada ou inválida.'), ['exp_year']))
export type CreditCard = v.InferOutput<typeof CardSchema>
export type CardFormValues = v.InferOutput<typeof CardFormSchema>
export type ProfileInput = v.InferOutput<typeof ProfileInputSchema>
