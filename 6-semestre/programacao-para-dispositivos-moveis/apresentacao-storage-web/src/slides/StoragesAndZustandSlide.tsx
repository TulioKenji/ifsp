import { SlideWrapper, SlideTitle, CodeBlock, FeatureCard } from '../components/shared';

export function StoragesAndZustandSlide() {
  return (
    <SlideWrapper>
      <SlideTitle
        badge="State Management + Persistência"
        title="Storages & Zustand"
        subtitle="Como combinar soluções de storage com Zustand para gerenciamento de estado persistente de forma elegante e performática."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Por que Zustand?
          </h3>
          <div className="space-y-3">
            <FeatureCard
              icon={<span className="text-xl">🪶</span>}
              title="Leve (~1KB)"
              description="Muito menor que Redux, sem boilerplate. API simples e direta."
              color="amber"
            />
            <FeatureCard
              icon={<span className="text-xl">🔌</span>}
              title="Middleware de Persistência"
              description="Plugin oficial createJSONStorage para integrar com qualquer storage"
              color="indigo"
            />
            <FeatureCard
              icon={<span className="text-xl">🎯</span>}
              title="Seletivo"
              description="Re-renderiza apenas componentes que usam a parte específica do state"
              color="cyan"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Arquitetura
          </h3>
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-sm text-indigo-300 font-medium">Zustand Store</span>
                <span className="text-xs text-slate-400">State + Actions</span>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-sm text-cyan-300 font-medium">persist middleware</span>
                <span className="text-xs text-slate-400">Serialização</span>
              </div>
              <div className="flex justify-center">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-xs text-emerald-300">MMKV</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs text-rose-300">SecureStore</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs text-amber-300">AsyncStorage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Exemplo com MMKV
      </h3>
      <CodeBlock
        title="useStore.ts"
        code={`import { createMMKV } from 'react-native-mmkv';
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
`}
      />
    </SlideWrapper>
  );
}
