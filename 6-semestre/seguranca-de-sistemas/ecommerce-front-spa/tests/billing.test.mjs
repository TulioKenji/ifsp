import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as v from 'valibot'
import { cpfDigits, phoneDigits, cardBrand, cardExpired } from '../src/utils/personal.ts'
import { ProfileInputSchema, ProfileSchema, CardFormSchema, CardSchema } from '../src/schemas/billing.ts'
import { CreateOrderSchema } from '../src/schemas/orders.ts'
import { validateEntries } from '../src/stores/cart-core.ts'

test('CPF valida dígitos verificadores sem aceitar sequências, letras ou injeção', () => {
  assert.equal(cpfDigits('529.982.247-25'), '52998224725')
  for (const raw of ['', '00000000000', '11111111111', '52998224724', '<script>', '529a98224725']) assert.equal(cpfDigits(raw), undefined)
})
test('telefone brasileiro aceita DDD e +55, recusando entradas inválidas', () => {
  assert.equal(phoneDigits('(11) 99999-9999'), '+5511999999999')
  assert.equal(phoneDigits('+55 (11) 3333-4444'), '+551133334444')
  for (const raw of ['', '0000000000', '+1 2125551234', '11abcdefghi', '11123456789']) assert.equal(phoneDigits(raw), undefined)
})
test('cartão valida bandeira, Luhn e validade sem afirmar autorização bancária', () => {
  assert.equal(cardBrand('4242 4242 4242 4242'), 'Visa')
  assert.equal(cardBrand('5555555555554444'), 'Mastercard')
  assert.equal(cardBrand('378282246310005'), 'Amex')
  for (const raw of ['0000000000000000', '4242424242424241', '4242a424242424242', '<script>']) assert.equal(cardBrand(raw), undefined)
  const now = new Date('2030-04-15T00:00:00Z')
  assert.equal(cardExpired(3, 2030, now), true)
  assert.equal(cardExpired(4, 2030, now), false)
})
test('schemas exigem senha, recusam CVV e dados completos em respostas mascaradas', () => {
  const input = { cpf: '52998224725', phone: '11999999999', current_password: 'test-password-long' }
  assert.equal(v.safeParse(ProfileInputSchema, input).success, true)
  assert.equal(v.safeParse(ProfileInputSchema, { ...input, current_password: '' }).success, false)
  assert.equal(v.safeParse(ProfileSchema, { complete: true, cpf_masked: '***.***.***-25', phone_masked: '****-9999', cpf: input.cpf }).success, false)
  const card = { number: '4242424242424242', holder_name: 'ALUNO TESTE', exp_month: '12', exp_year: String(new Date().getUTCFullYear() + 2), current_password: 'test-password-long' }
  assert.equal(v.safeParse(CardFormSchema, card).success, true)
  assert.equal(v.safeParse(CardFormSchema, { ...card, cvv: '123' }).success, false)
  assert.equal(v.safeParse(CardFormSchema, { ...card, exp_year: '2000' }).success, false)
  assert.equal(v.safeParse(CardSchema, { id: '00000000-0000-0000-0000-000000000001', brand: 'Visa', last4: '4242', exp_month: 12, exp_year: 2030, created_at: '', number: card.number }).success, false)
})
test('checkout exige cartão; carrinho persistido recusa dados pessoais e de cartão', () => {
  const id = '00000000-0000-0000-0000-000000000001'
  const item = { product_id: id, quantity: 1, options: {} }
  assert.equal(v.safeParse(CreateOrderSchema, { address_id: id, items: [item] }).success, false)
  assert.equal(v.safeParse(CreateOrderSchema, { address_id: id, credit_card_id: id, items: [item] }).success, true)
  for (const extra of [{ cpf: '52998224725' }, { number: '4242424242424242' }, { credit_card_id: id }]) assert.equal(validateEntries([{ ...item, ...extra }]), null)
})
