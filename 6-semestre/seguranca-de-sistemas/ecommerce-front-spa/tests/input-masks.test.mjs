import { test } from 'node:test'
import assert from 'node:assert/strict'
import { maskInput, maskedCursor, deleteMaskedSeparator } from '../src/utils/input-masks.ts'
import { cpfDigits, phoneDigits, cardBrand } from '../src/utils/personal.ts'

test('formata CPF/CEP digitados ou colados, incluindo valores incompletos', () => {
  assert.equal(maskInput('52998224725', 'cpf'), '529.982.247-25')
  assert.equal(maskInput('529.982.247-25', 'cpf'), '529.982.247-25')
  assert.equal(maskInput('5299', 'cpf'), '529.9')
  assert.equal(maskInput('12345678', 'postalCode'), '12345-678')
  assert.equal(cpfDigits(maskInput('52998224725', 'cpf')), '52998224725')
  assert.equal(maskInput('', 'cpf'), '')
})
test('formata telefone fixo/móvel, com código do Brasil opcional', () => {
  assert.equal(maskInput('1133334444', 'phone'), '(11) 3333-4444')
  assert.equal(maskInput('11999999999', 'phone'), '(11) 99999-9999')
  assert.equal(maskInput('+5511999999999', 'phone'), '+55 (11) 99999-9999')
  assert.equal(maskInput('5511999999999', 'phone'), '+55 (11) 99999-9999')
  assert.equal(phoneDigits(maskInput('+5511999999999', 'phone')), '+5511999999999')
  assert.equal(maskInput('+', 'phone'), '+')
  assert.equal(maskInput('+56 (11) 99999-9999', 'phone'), '+5611999999999')
})
test('cartões usam grupos apropriados, sem perder dígitos de Amex ou Visa de 19 dígitos', () => {
  assert.equal(maskInput('4242424242424242', 'card'), '4242 4242 4242 4242')
  assert.equal(maskInput('378282246310005', 'card'), '3782 822463 10005')
  assert.equal(maskInput('4000000000000000006', 'card'), '4000 0000 0000 0000 006')
  assert.equal(cardBrand(maskInput('378282246310005', 'card')), 'Amex')
  assert.equal(maskInput('12', 'month'), '12')
  assert.equal(maskInput('2030', 'year'), '2030')
})
test('edição no meio mantém o cursor e permite apagar junto às pontuações', () => {
  assert.equal(maskedCursor('5299', 4, maskInput('5299', 'cpf')), 5)
  assert.equal(maskedCursor('+', 1, '+'), 1)
  const deletion = deleteMaskedSeparator('529.982.247-25', 4, 'Backspace')
  assert.equal(maskInput(deletion.raw, 'cpf'), '529.822.472-5')
  assert.equal(maskedCursor(deletion.raw, deletion.cursor, maskInput(deletion.raw, 'cpf')), 2)
  const forward = deleteMaskedSeparator('529.982.247-25', 3, 'Delete')
  assert.equal(maskInput(forward.raw, 'cpf'), '529.822.472-5')
  assert.equal(deleteMaskedSeparator('529.9', 2, 'Backspace'), undefined)
})
test('máscaras têm tamanho limitado mesmo diante de colagens enormes', () => {
  assert.equal(maskInput('9'.repeat(10000), 'cpf').length, 14)
  assert.ok(maskInput('9'.repeat(10000), 'phone').length <= 19)
  assert.equal(maskInput('9'.repeat(10000), 'card').replace(/ /g, '').length, 19)
  assert.equal(maskInput('<script>alert(1)</script>', 'cpf'), '1')
})
