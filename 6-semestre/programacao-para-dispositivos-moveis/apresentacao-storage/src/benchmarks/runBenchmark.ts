import { cartItens } from '@/constants/cartItens';
import type { CartItem } from '@/stores/useCart';
import { useCart } from '@/stores/useCart';
import { flushAsyncStorageWrites, useCartAsyncStorage } from '@/stores/useCartAsyncStorage';
import { flushSqliteWrites, useCartSqlite } from '@/stores/useCartSqlite';
import { pureAdapters } from './Purestorages';

export type BenchRow = {
  group: 'Pure' | 'Zustand';
  scenario: string;
  lib: string;
  ms: number;
};

const RUNS = 3; // mediana de N execuções (após 1 warm-up)

const now = () => performance.now();

async function timed(fn: () => unknown | Promise<unknown>) {
  const t0 = now();
  await fn();
  return now() - t0;
}

/** Cada execução devolve seu próprio tempo, assim o setup fica fora do cronômetro. */
async function median(run: () => Promise<number>) {
  await run(); // warm-up
  const samples: number[] = [];
  for (let i = 0; i < RUNS; i++) samples.push(await run());
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

export function buildItems(multiplier: number): CartItem[] {
  const total = cartItens.length * multiplier;
  return Array.from({ length: total }, (_, i) => {
    const base = cartItens[i % cartItens.length];
    return { ...base, name: `${base.name}#${i}` }; // nomes únicos
  });
}

type CartStoreLike = {
  getState: () => {
    items: Record<string, CartItem>;
    addItem: (item: CartItem) => void;
    clearCart: () => void;
  };
  persist: { rehydrate: () => Promise<void> | void };
};

const zustandTargets: { lib: string; store: CartStoreLike; flush: () => Promise<void> }[] = [
  { lib: 'MMKV', store: useCart as unknown as CartStoreLike, flush: async () => {} }, // síncrono
  { lib: 'AsyncStorage', store: useCartAsyncStorage, flush: flushAsyncStorageWrites },
  { lib: 'SQLite', store: useCartSqlite, flush: flushSqliteWrites },
];

export async function runBenchmark(
  items: CartItem[],
  onProgress?: (label: string) => void
): Promise<BenchRow[]> {
  const rows: BenchRow[] = [];
  const names = items.map((i) => i.name);
  const n = items.length;

  // ---------- Funções puras ----------
  for (const a of pureAdapters) {
    onProgress?.(`Pure · ${a.name}`);

    rows.push({
      group: 'Pure', lib: a.name, scenario: 'Set — 1 blob (array inteiro)',
      ms: await median(async () => { await a.clear(); return timed(() => a.setBlob(items)); }),
    });

    await a.setBlob(items);
    rows.push({
      group: 'Pure', lib: a.name, scenario: 'Get — 1 blob (array inteiro)',
      ms: await median(() => timed(() => a.getBlob())),
    });

    rows.push({
      group: 'Pure', lib: a.name, scenario: `Set — ${n} chaves (1 por item)`,
      ms: await median(async () => { await a.clear(); return timed(() => a.setEach(items)); }),
    });

    await a.setEach(items);
    rows.push({
      group: 'Pure', lib: a.name, scenario: `Get — ${n} chaves (1 por item)`,
      ms: await median(() => timed(() => a.getEach(names))),
    });

    await a.clear();
  }

  // ---------- Zustand persist ----------
  for (const { lib, store, flush } of zustandTargets) {
    onProgress?.(`Zustand · ${lib}`);

    rows.push({
      group: 'Zustand', lib, scenario: `Set — ${n}x addItem (persist)`,
      ms: await median(async () => {
        store.getState().clearCart();
        await flush();
        return timed(async () => {
          for (const item of items) store.getState().addItem(item);
          await flush(); // espera todas as escritas assíncronas terminarem
        });
      }),
    });

    await flush();
    rows.push({
      group: 'Zustand', lib, scenario: 'Get — rehydrate (lê estado salvo)',
      ms: await median(() => timed(() => store.persist.rehydrate())),
    });

    store.getState().clearCart();
    await flush();
  }

  return rows;
}
