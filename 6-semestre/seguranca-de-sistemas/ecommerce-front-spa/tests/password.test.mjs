import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as v from 'valibot'
import { NewPasswordSchema, CurrentPasswordSchema } from '../src/schemas/password.ts'

test('cadastro exige 12 caracteres Unicode e mensagens não expõem bytes', () => {
  for (const password of ['á'.repeat(6), '😀'.repeat(6), 'a'.repeat(11)]) {
    const result = v.safeParse(NewPasswordSchema, password)
    assert.equal(result.success, false)
    assert.match(result.issues[0].message, /12 caracteres/)
  }
  for (const password of ['á'.repeat(12), '😀'.repeat(12), 'a'.repeat(72)]) assert.equal(v.safeParse(NewPasswordSchema, password).success, true)
  const result = v.safeParse(NewPasswordSchema, '😀'.repeat(19))
  assert.equal(result.success, false)
  assert.doesNotMatch(result.issues[0].message, /bytes/i)
})
test('login e confirmação preservam senhas Unicode legadas sem enfraquecer o cadastro', () => {
  assert.equal(v.safeParse(CurrentPasswordSchema, 'á'.repeat(6)).success, true)
  assert.equal(v.safeParse(CurrentPasswordSchema, '').success, false)
})
