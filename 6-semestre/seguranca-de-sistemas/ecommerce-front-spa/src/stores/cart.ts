import { useStore } from 'zustand'
import { cartStore } from './cart-core'

export function useCart() { return useStore(cartStore) }
