import { createMMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';


type CartItem = {
    name: string;
    price: number;
    quantity: number;
};

interface CartState {
    items: Record<string, CartItem>;
    addItem: (item: CartItem) => void;
    updateItemQuantity: (id: string, quantity: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
}

const id = 'use-cart-storage';

const storage = createMMKV({ id });

const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        return storage.set(name, value)
    },
    getItem: (name) => {
        const value = storage.getString(name)
        return value ?? null
    },
    removeItem: (name) => {
        return storage.remove(name)
    },
}

export const useCart = create<CartState>()
    (
        persist(
            (set) => ({
                items: {},
                addItem: (item) => {
                    set((state) => ({
                        items: {
                            ...state.items,
                            [item.name]: item,
                        },
                    }));
                }
                ,
                updateItemQuantity: (id, quantity) => {
                    set((state) => ({
                        items: {
                            ...state.items,
                            [id]: {
                                ...state.items[id],
                                quantity,
                            },
                        },
                    }));
                },
                removeItem: (id) => {
                    set((state) => {
                        const newItems = { ...state.items };
                        delete newItems[id];
                        return { items: newItems };
                    }
                    );
                },
                clearCart: () => {
                    set({ items: {} });
                },
            }),
            {
                name: id,
                storage: createJSONStorage(() => zustandStorage),
            }
        )
    );
