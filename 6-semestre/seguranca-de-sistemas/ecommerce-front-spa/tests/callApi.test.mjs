import { test } from 'node:test'
import assert from 'node:assert/strict'
import callApi, { setCSRFToken } from '../src/service/callApi.ts'

test('preserva 201 e 204 sem corpo (cadastro/logout)', async (t) => {
  for (const status of [201, 204]) {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status }))
    const result = await callApi({ url: 'auth/register', method: 'POST', body: '{}' })
    assert.equal(result.status, status)
    assert.equal(result.data, null)
    assert.equal(result.error, undefined)
    t.mock.restoreAll()
  }
})

test('envia cookie na mesma origem e CSRF em escrita sem persistir segredo', async (t) => {
  setCSRFToken('csrf-test')
  t.after(() => setCSRFToken())
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/orders')
    assert.equal(options.credentials, 'same-origin')
    assert.equal(options.headers.get('Content-Type'), 'application/json')
    assert.equal(options.headers.get('X-CSRF-Token'), 'csrf-test')
    return Response.json({ id: 'order' }, { status: 201 })
  })
  const result = await callApi({ url: 'orders', method: 'POST', body: '{}' })
  assert.deepEqual(result.data, { id: 'order' })
})

test('preserva erro JSON do servidor e status de conflito', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Estoque insuficiente' }, { status: 409 }))
  const result = await callApi({ url: 'orders' })
  assert.equal(result.status, 409)
  assert.equal(result.error, 'Estoque insuficiente')
  assert.equal(result.data, null)
})

test('normaliza falha de transporte', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline') })
  const result = await callApi({ url: 'products' })
  assert.equal(result.data, null)
  assert.match(result.error, /offline/)
})
