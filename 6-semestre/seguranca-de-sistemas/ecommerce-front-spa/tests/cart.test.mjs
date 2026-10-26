import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createCartStore, entryKey, validateEntries, STORAGE_KEY, MAX_STORAGE_CHARS } from '../src/stores/cart-core.ts'

const id = (n = 1) => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const item = (quantity = 1, n = 1, options = {}) => ({ product_id: id(n), quantity, options })
function memory(raw = null) {
  let saved = raw
  return { getItem: () => saved, setItem: (_, value) => { saved = value }, removeItem: () => { saved = null } }
}
const envelope = (items) => JSON.stringify({ version: 1, state: { items } })

test('persiste só IDs, opções e quantidade; hidrata e combina itens iguais', () => {
  const storage = memory(), store = createCartStore(storage)
  assert.equal(store.getState().save(item(2, 1, { tamanho: 'M', cor: 'Verde' })), undefined)
  store.getState().save(item(3, 1, { cor: 'Verde', tamanho: 'M' }))
  assert.equal(store.getState().items.length, 1)
  assert.equal(store.getState().items[0].quantity, 5)
  assert.deepEqual(Object.keys(JSON.parse(storage.getItem(STORAGE_KEY)).state), ['items'])
  assert.deepEqual(createCartStore(storage).getState().items, store.getState().items)
  assert.equal(validateEntries([{ ...item(), price: '0.01' }]), null)
})
test('rejeita 1000 linhas, total excessivo, duplicatas, IDs e números adulterados', () => {
  for (const bad of [Array.from({ length: 1000 }, (_, n) => item(1, n)), [item(1001)], [item(60), item(60, 2)], [item(), item()], [{ ...item(), product_id: "' OR 1=1" }], [item(1.5)], [item(NaN)], [item(-1)]]) {
    assert.equal(validateEntries(bad), null)
    assert.deepEqual(createCartStore(memory(envelope(bad))).getState().items, [])
  }
  const store = createCartStore(memory())
  store.getState().save(item(100))
  assert.equal(typeof store.getState().save(item()), 'string')
  assert.equal(store.getState().items[0].quantity, 100)
})
test('verifica tamanho antes de JSON.parse e tolera armazenamento bloqueado', () => {
  for (const raw of ['{', 'x'.repeat(MAX_STORAGE_CHARS + 1), JSON.stringify({ version: 999, state: { items: [item()] } })]) {
    assert.deepEqual(createCartStore(memory(raw)).getState().items, [])
  }
  const blocked = () => { throw new Error('storage disabled') }
  const store = createCartStore({ getItem: blocked, setItem: blocked, removeItem: blocked })
  assert.doesNotThrow(() => store.getState().save(item()))
  assert.equal(store.getState().items.length, 1)
})
test('impede prototype pollution e opções fora dos limites', () => {
  for (const options of [JSON.parse('{"__proto__":{"polluted":true}}'), { constructor: 'x' }, { cor: 'x'.repeat(41) }, { cor: '\u0000' }, { a: '1', b: '2', c: '3', d: '4', e: '5' }]) {
    assert.equal(validateEntries([item(1, 1, options)]), null)
  }
  assert.equal({}.polluted, undefined)
  assert.equal(typeof createCartStore(memory()).getState().save(null), 'string')
})
test('edição substitui quantidade, preserva outras variações e só remove após ação', () => {
  const store = createCartStore(memory())
  store.getState().save(item(2, 1, { tamanho: 'M' }))
  store.getState().save(item(3, 1, { tamanho: 'G' }))
  const key = entryKey(item(2, 1, { tamanho: 'M' }))
  store.getState().save(item(4, 1, { tamanho: 'M' }), key)
  assert.equal(store.getState().items.reduce((n, i) => n + i.quantity, 0), 7)
  assert.equal(typeof store.getState().save(item(4, 1, { tamanho: 'G' }), key), 'string')
  store.getState().setBusy(true)
  assert.equal(typeof store.getState().save(item()), 'string')
  store.getState().remove(key)
  assert.equal(store.getState().items.length, 2)
  store.getState().setBusy(false)
  store.getState().remove(key)
  assert.equal(store.getState().items.length, 1)
  store.getState().clear()
  assert.deepEqual(store.getState().items, [])
})
test('50 linhas válidas são aceitas e a 51ª é recusada', () => {
  const store = createCartStore(memory())
  for (let n = 1; n <= 50; n++) assert.equal(store.getState().save(item(1, n)), undefined)
  assert.equal(typeof store.getState().save(item(1, 51)), 'string')
  assert.equal(store.getState().items.length, 50)
})
