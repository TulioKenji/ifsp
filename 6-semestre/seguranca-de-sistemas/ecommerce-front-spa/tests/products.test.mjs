import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fetchProduct } from '../src/service/products.ts'
import { catalogSearch } from '../src/utils/catalog-search.ts'

const id = '00000000-0000-0000-0000-000000000001'
test('detalhe usa endpoint por UUID e valida galeria, descrição e opções', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(url, `/api/products/${id}`)
    return Response.json({ id, name: 'Teclado', slug: 'teclado', description: 'Descrição completa', price: '99.90', stock_quantity: 3, active: true, options: { tipo: ['ABNT2', 'US'] }, url: ['https://example.com/1.png', 'https://example.com/2.png'], created_at: '', updated_at: '' })
  })
  const detail = await fetchProduct(id)
  assert.equal(detail.url.length, 2)
  assert.equal(detail.description, 'Descrição completa')
  assert.deepEqual(detail.options.tipo, ['ABNT2', 'US'])
})
test('UUID adulterado não gera request e produto ausente retorna mensagem útil', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('não deveria chamar') })
  await assert.rejects(fetchProduct("' OR 1=1"), /Produto inválido/)
  assert.equal(globalThis.fetch.mock.callCount(), 0)
  t.mock.restoreAll()
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'not found' }, { status: 404 }))
  await assert.rejects(fetchProduct(id), /não está disponível/)
})
test('busca por URL descarta valores malformados/grandes e preserva o termo normalizado', () => {
  assert.deepEqual(catalogSearch('  teclado  '), { q: 'teclado' })
  for (const value of [undefined, ['ssd'], {}, '', 'x'.repeat(121), 'a\u0000b']) assert.deepEqual(catalogSearch(value), {})
})
