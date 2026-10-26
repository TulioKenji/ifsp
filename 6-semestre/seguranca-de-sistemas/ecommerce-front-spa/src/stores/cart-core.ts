import { createStore } from 'zustand/vanilla'
import { persist, type PersistStorage, type StateStorage } from 'zustand/middleware'

export type CartEntry = { product_id: string; quantity: number; options: Record<string, string> }
export const MAX_LINES = 50
export const MAX_UNITS = 100
export const STORAGE_KEY = 'greenstore-cart-v1'
export const MAX_STORAGE_CHARS = 8192 // Até 16 KiB em UTF-16; antes de JSON.parse.
const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i
const forbidden = new Set(['__proto__', 'prototype', 'constructor'])
const plain = (s: string, max: number) => s.length > 0 && s.length <= max && Array.from(s).every((c) => c.charCodeAt(0) >= 32 && (c.charCodeAt(0) < 127 || c.charCodeAt(0) > 159))
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

export function entryKey(entry: Pick<CartEntry, 'product_id' | 'options'>) {
  return entry.product_id.toLowerCase() + JSON.stringify(Object.entries(entry.options).sort(([a], [b]) => a.localeCompare(b)))
}

// O localStorage é entrada externa. Valida tamanho/contagem antes de percorrer itens.
export function validateEntries(value: unknown): CartEntry[] | null {
  if (!Array.isArray(value) || value.length > MAX_LINES) return null
  const out: CartEntry[] = [], seen = new Set<string>()
  let units = 0
  for (const item of value) {
    if (!record(item) || Object.keys(item).some((k) => !['product_id', 'quantity', 'options'].includes(k))) return null
    if (typeof item.product_id !== 'string' || !uuid.test(item.product_id) || !Number.isInteger(item.quantity) || Number(item.quantity) < 1 || Number(item.quantity) > MAX_UNITS || !record(item.options)) return null
    const pairs = Object.entries(item.options)
    if (pairs.length > 4) return null
    const options: Record<string, string> = {}
    for (const [key, value] of pairs) {
      if (forbidden.has(key) || !/^[a-z][a-z0-9_]{0,19}$/.test(key) || typeof value !== 'string' || !plain(value, 40)) return null
      options[key] = value
    }
    const entry = { product_id: item.product_id.toLowerCase(), quantity: Number(item.quantity), options }
    const key = entryKey(entry)
    units += entry.quantity
    if (seen.has(key) || units > MAX_UNITS) return null
    seen.add(key); out.push(entry)
  }
  return out
}

type CartState = {
  items: CartEntry[]
  busy: boolean
  setBusy: (busy: boolean) => void
  save: (entry: CartEntry, previousKey?: string) => string | undefined
  remove: (key: string) => void
  clear: () => void
}

export function createCartStore(storage: StateStorage) {
  const safe: PersistStorage<Pick<CartState, 'items'>> = {
    getItem(name) {
      try {
        const raw = storage.getItem(name)
        if (typeof raw !== 'string') return null
        if (raw.length > MAX_STORAGE_CHARS) { storage.removeItem(name); return null }
        const parsed: unknown = JSON.parse(raw)
        const items = record(parsed) && parsed.version === 1 && record(parsed.state) ? validateEntries(parsed.state.items) : null
        if (!items) { storage.removeItem(name); return null }
        return { state: { items }, version: 1 }
      } catch { return null }
    },
    setItem(name, value) {
      try {
        const items = validateEntries(value.state.items) ?? []
        const raw = JSON.stringify({ state: { items }, version: 1 })
        if (raw.length <= MAX_STORAGE_CHARS) storage.setItem(name, raw)
      } catch { /* Quota/privacidade: a loja continua funcionando em memória. */ }
    },
    removeItem(name) { try { storage.removeItem(name) } catch { /* armazenamento indisponível */ } },
  }
  return createStore<CartState>()(persist((set, get) => ({
    items: [],
    busy: false,
    setBusy(busy) { set({ busy }) },
    save(entry, previousKey) {
      if (get().busy) return 'Aguarde a confirmação do pedido para alterar o carrinho.'
      const candidate = validateEntries([entry])?.[0]
      if (!candidate) return 'Item inválido.'
      entry = candidate
      const key = entryKey(entry)
      const current = get().items
      const duplicate = current.find((i) => entryKey(i) === key && entryKey(i) !== previousKey)
      const items = current.filter((i) => entryKey(i) !== previousKey && entryKey(i) !== key)
      items.push({ ...entry, quantity: entry.quantity + (previousKey ? 0 : duplicate?.quantity ?? 0) })
      if (previousKey && duplicate) return 'Essa combinação já está no carrinho. Edite o item existente.'
      const validated = validateEntries(items)
      if (!validated) return 'Limite de 50 combinações e 100 unidades por carrinho.'
      if (JSON.stringify({ state: { items: validated }, version: 1 }).length > MAX_STORAGE_CHARS) return 'Carrinho muito grande. Reduza o número de itens ou opções.'
      set({ items: validated })
    },
    remove(key) { if (!get().busy) set({ items: get().items.filter((i) => entryKey(i) !== key) }) },
    clear() { set({ items: [] }) },
  }), { name: STORAGE_KEY, version: 1, storage: safe, partialize: (s) => ({ items: s.items }),
    merge: (saved, current) => ({ ...current, items: record(saved) ? validateEntries(saved.items) ?? [] : [] }),
  }))
}

const browserStorage: StateStorage = {
  getItem: (key) => typeof window === 'undefined' ? null : window.localStorage.getItem(key),
  setItem: (key, value) => { if (typeof window !== 'undefined') window.localStorage.setItem(key, value) },
  removeItem: (key) => { if (typeof window !== 'undefined') window.localStorage.removeItem(key) },
}
export const cartStore = createCartStore(browserStorage)
