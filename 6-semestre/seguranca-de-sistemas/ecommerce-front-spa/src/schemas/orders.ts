import * as v from 'valibot'

// Controles não pertencem a endereços; texto HTML é exibido pelo escape do React.
const safeText = v.check((s: string) => Array.from(s).every((c) => c.charCodeAt(0) >= 32 && (c.charCodeAt(0) < 127 || c.charCodeAt(0) > 159)), 'Remova os caracteres de controle.')
const text = (max: number) => v.pipe(v.string(), v.trim(), v.minLength(1, 'Campo obrigatório.'), v.maxLength(max, `Use no máximo ${max} caracteres.`), safeText)
export const AddressSchema = v.object({
  recipient_name: text(150), postal_code: text(20), street: text(200), number: text(20),
  complement: v.pipe(v.string(), v.maxLength(100, 'Use até 100 caracteres.'), safeText), neighborhood: text(100), city: text(100), state: text(100), country: text(100),
})
export const SavedAddressSchema = v.object({ ...AddressSchema.entries, id: v.pipe(v.string(), v.uuid()), created_at: v.string(), updated_at: v.string() })
const money = v.pipe(v.string(), v.regex(/^\d+\.\d{2}$/))
export const OrderSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  address_id: v.pipe(v.string(), v.uuid()), coupon_code: v.optional(v.string(), ''),
  credit_card_id: v.nullable(v.pipe(v.string(), v.uuid())), card_brand: v.string(), card_last4: v.string(),
  status: v.picklist(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  subtotal: money, shipping_cost: money, discount: money, total: money, currency: v.literal('BRL'),
  shipping_address: AddressSchema,
  items: v.array(v.object({
    id: v.string(), product_id: v.nullable(v.string()), product_name: v.string(), sku: v.nullable(v.string()),
    quantity: v.pipe(v.number(), v.integer(), v.minValue(1)), unit_price: money, total_price: money, options: v.optional(v.record(v.string(), v.string()), {}),
  })),
  created_at: v.string(), updated_at: v.string(),
})
export const OrdersSchema = v.object({
  data: v.array(OrderSchema),
  pagination: v.object({ page: v.number(), size: v.number(), total: v.number(), total_pages: v.number() }),
})
export const CreateOrderSchema = v.object({
  credit_card_id: v.pipe(v.string(), v.uuid('Escolha um cartão.')),
  address_id: v.pipe(v.string(), v.uuid('Escolha um endereço.')), coupon_code: v.optional(v.pipe(v.string(), v.maxLength(20))),
  items: v.pipe(v.array(v.object({
    product_id: v.pipe(v.string(), v.uuid()), quantity: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)), options: v.record(v.string(), v.string()),
  })), v.minLength(1), v.maxLength(50)),
})
