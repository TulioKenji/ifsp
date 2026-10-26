import type * as v from 'valibot'
import type { AddressSchema, SavedAddressSchema, CreateOrderSchema, OrderSchema } from '../schemas/orders'

// Inferir o tipo do schema evita manter duas definições divergentes do contrato.
export type Address = v.InferOutput<typeof AddressSchema>
export type SavedAddress = v.InferOutput<typeof SavedAddressSchema>
export type Order = v.InferOutput<typeof OrderSchema>
export type CreateOrder = v.InferOutput<typeof CreateOrderSchema>
