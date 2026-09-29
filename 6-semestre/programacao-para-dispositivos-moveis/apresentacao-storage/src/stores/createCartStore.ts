import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import type { CartItem } from './useCart';

export interface CartState {
  items: Record<string, CartItem>;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

/**
 * Envolve um StateStorage e guarda as escritas em andamento.
 * Storages assíncronos (AsyncStorage/SQLite) não são aguardados pelo zustand,
 * então `flush()` permite esperar tudo ser gravado antes de parar o cronômetro.
 */
export function trackPendingWrites(storage: StateStorage) {
  const pending = new Set<Promise<unknown>>();

  const tracked: StateStorage = {
    getItem: (name) => storage.getItem(name),
    removeItem: (name) => storage.removeItem(name),
    setItem: (name, value) => {
      const p: Promise<unknown> = Promise.resolve(storage.setItem(name, value));
      pending.add(p);
      const done = () => pending.delete(p);
      p.then(done, done);
      return p as Promise<void>;
    },
  };

  const flush = async () => {
    await Promise.all([...pending]);
  };

  return { storage: tracked, flush };
}

export function createCartStore(name: string, storage: StateStorage) {
  return create<CartState>()(
    persist(
      (set) => ({
        items: {},
        addItem: (item) =>
          set((state) => ({
            items: { ...state.items, [item.name]: item },
          })),
        updateItemQuantity: (id, quantity) =>
          set((state) => ({
            items: {
              ...state.items,
              [id]: { ...state.items[id], quantity },
            },
          })),
        removeItem: (id) =>
          set((state) => {
            const newItems = { ...state.items };
            delete newItems[id];
            return { items: newItems };
          }),
        clearCart: () => set({ items: {} }),
      }),
      {
        name,
        storage: createJSONStorage(() => storage),
      }
    )
  );
}
