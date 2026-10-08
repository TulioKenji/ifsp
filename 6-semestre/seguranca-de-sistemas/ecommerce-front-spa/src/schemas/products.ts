import * as v from 'valibot'

export const ProductQueryParamsRequestSchema = v.object({
  page: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
  size: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100))),
  field: v.optional(v.picklist(['all', 'name', 'description', 'sku'])),
  queryparam: v.optional(v.pipe(v.string(), v.trim(), v.maxLength(120))),
})

export const ProductSearchSchema = v.object({
  queryparam: v.pipe(v.string(), v.trim(), v.maxLength(120, 'A busca deve ter no máximo 120 caracteres.')),
})

export const ProductResponseSchema = v.object({
  pagination: v.object({
    page: v.number(),
    size: v.number(),
    total: v.number(),
    total_pages: v.number(),
  }),
  data: v.array(v.object({
    id: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.string(),
    stock_quantity: v.number(),
    sku: v.string(),
    active: v.boolean(),
    url: v.nullable(v.string()),
  })),
})