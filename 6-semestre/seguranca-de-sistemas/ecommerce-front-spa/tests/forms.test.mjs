import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as v from 'valibot'
import { getField, setField, validateForm } from '../src/utils/form-state.ts'
import { AddressSchema } from '../src/schemas/orders.ts'

test('campos aninhados preservam usuário e outros endereços sem mutação', () => {
  const original = { name: 'Ana', addresses: [{ city: 'São Paulo' }, { city: 'Campinas' }] }
  const updated = setField(original, 'addresses.1.city', 'Santos')
  assert.equal(getField(updated, 'addresses.1.city'), 'Santos')
  assert.equal(original.addresses[1].city, 'Campinas')
  assert.equal(updated.addresses[0], original.addresses[0])
  assert.equal(updated.name, 'Ana')
})
test('caminhos não permitem prototype pollution, índices enormes ou profundidade ilimitada', () => {
  for (const path of ['__proto__.polluted', 'addresses.0.constructor.prototype', 'addresses.1000.city', Array(10).fill('a').join('.')]) {
    assert.throws(() => setField({}, path, true))
    assert.throws(() => getField({}, path))
  }
  assert.equal({}.polluted, undefined)
})
test('validação retorna mensagem sob caminho exato para arrays de endereços', () => {
  const schema = v.object({ addresses: v.array(v.object({ city: v.pipe(v.string(), v.minLength(1, 'Informe a cidade.')) })) })
  assert.deepEqual(validateForm(schema, { addresses: [{ city: '' }] }).errors, { 'addresses.0.city': 'Informe a cidade.' })
  assert.equal(validateForm(schema, { addresses: [{ city: 'Santos' }] }).success, true)
})
test('endereço exige campos, remove espaços e recusa controles, sem interpretar HTML', () => {
  const address = { recipient_name: ' Ana ', street: '<img src=x onerror=alert(1)>', number: '10', complement: '', neighborhood: 'Centro', city: 'Cidade', state: 'SP', postal_code: '12345-678', country: 'BR' }
  const result = validateForm(AddressSchema, address)
  assert.equal(result.success, true)
  assert.equal(result.data.recipient_name, 'Ana')
  assert.equal(result.data.street, address.street) // Texto deve ser escapado na renderização React.
  assert.equal(validateForm(AddressSchema, { ...address, city: '\u0000' }).success, false)
  assert.equal(validateForm(AddressSchema, { ...address, street: ' ' }).errors.street, 'Campo obrigatório.')
})
