import { create } from 'zustand'
import type { CartEntry } from './cart-core'

export type CartIntent = { productId: string; label?: string } & (
  { mode: 'add'; entry?: never; afterAdd?: 'checkout' } | { mode: 'edit' | 'remove'; entry: CartEntry }
)
export const useCartModal = create<{ intent: CartIntent | null; open: (intent: CartIntent) => void; close: () => void }>((set) => ({
  intent: null, open: (intent) => set({ intent }), close: () => set({ intent: null }),
}))
