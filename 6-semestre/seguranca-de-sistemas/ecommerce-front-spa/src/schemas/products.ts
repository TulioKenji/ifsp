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

export const ProductSchema = v.object({
  options: v.optional(v.pipe(v.record(v.pipe(v.string(), v.regex(/^[a-z][a-z0-9_]{0,19}$/), v.check((s) => s !== 'constructor' && s !== 'prototype')), v.pipe(v.array(v.pipe(v.string(), v.minLength(1), v.maxLength(40))), v.minLength(1), v.maxLength(8))), v.check((o) => Object.keys(o).length <= 4)), {}),
  id: v.string(), name: v.string(), slug: v.string(), description: v.optional(v.nullable(v.string())),
  price: v.pipe(v.string(), v.regex(/^\d+\.\d{2}$/)), stock_quantity: v.number(), sku: v.optional(v.nullable(v.string())), active: v.boolean(), url: v.nullable(v.string()),
})
export const ProductDetailSchema = v.object({ ...ProductSchema.entries, id: v.pipe(v.string(), v.uuid()), url: v.array(v.string()), created_at: v.string(), updated_at: v.string() })
export const ProductResponseSchema = v.object({
  pagination: v.object({
    page: v.number(),
    size: v.number(),
    total: v.number(),
    total_pages: v.number(),
  }),
  data: v.array(ProductSchema),
})
