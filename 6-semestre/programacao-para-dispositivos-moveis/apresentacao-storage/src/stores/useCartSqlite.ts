import { createCartStore, trackPendingWrites } from './createCartStore';
import { sqliteStateStorage } from './sqliteStorage';

const { storage, flush } = trackPendingWrites(sqliteStateStorage);

export const flushSqliteWrites = flush;
export const useCartSqlite = createCartStore('use-cart-sqlite-storage', storage);
