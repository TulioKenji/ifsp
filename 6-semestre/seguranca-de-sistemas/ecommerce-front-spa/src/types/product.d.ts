interface Product {
	options: Record<string, string[]>
  id: string
  name: string
  slug: string
  description?: string | null
  price: string
  stock_quantity: number
  sku?: string | null
  active: boolean
  url: string | null
}
interface ProductDetail extends Omit<Product, 'url'> {
  url: string[]
  created_at: string
  updated_at: string
}
