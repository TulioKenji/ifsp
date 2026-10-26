import * as v from 'valibot'
import callApi from './callApi.ts'
import { ProductQueryParamsRequestSchema, ProductResponseSchema, ProductDetailSchema } from '../schemas/products.ts'

export async function fetchProducts({ page, queryparam }: APIQueryParamsRequest): Promise<APIQueryParamsResponse<Product>> {
  const request = v.parse(ProductQueryParamsRequestSchema, { page: page ?? 1, size: 20, field: 'all', queryparam })
  const params = new URLSearchParams({ page: String(request.page), size: String(request.size), field: request.field ?? 'all' })
  if (request.queryparam) params.set('queryparam', request.queryparam)
  const result = await callApi<unknown>({ url: `products?${params}` })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível carregar os produtos.')
  return v.parse(ProductResponseSchema, result.data)
}

export async function fetchProduct(id: string): Promise<ProductDetail> {
  if (!v.safeParse(v.pipe(v.string(), v.uuid()), id).success) throw new Error('Produto inválido.')
  const result = await callApi<unknown>({ url: `products/${encodeURIComponent(id)}` })
  if (!result.data) throw new Error(result.status === 404 ? 'Este produto não está disponível.' : result.error ?? 'Não foi possível carregar o produto.')
  return v.parse(ProductDetailSchema, result.data)
}

export async function fetchCartProducts(ids: string[]): Promise<Product[]> {
  if (!ids.length) return []
  if (ids.length > 50 || ids.some((id) => !v.safeParse(v.pipe(v.string(), v.uuid()), id).success)) throw new Error('Carrinho inválido.')
  const result = await callApi<unknown>({ url: `products?ids=${encodeURIComponent(ids.join(','))}&size=50` })
  if (!result.data) throw new Error(result.error ?? 'Não foi possível conferir o carrinho.')
  return v.parse(ProductResponseSchema, result.data).data
}
