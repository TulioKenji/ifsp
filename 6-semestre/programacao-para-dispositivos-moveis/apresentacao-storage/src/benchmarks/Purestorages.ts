import { db } from '@/stores/sqliteStorage';
import type { CartItem } from '@/stores/useCart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMMKV } from 'react-native-mmkv';

const PREFIX = 'bench:';
const BLOB_KEY = `${PREFIX}blob`;
const itemKey = (name: string) => `${PREFIX}item:${name}`;

export type StorageAdapter = {
  name: string;
  /** Grava o array inteiro em UMA chave (1 operação) */
  setBlob(items: CartItem[]): Promise<void>;
  getBlob(): Promise<CartItem[]>;
  /** Grava cada item em uma chave própria (N operações sequenciais) */
  setEach(items: CartItem[]): Promise<void>;
  getEach(names: string[]): Promise<CartItem[]>;
  clear(): Promise<void>;
};

// ---------- MMKV (síncrono; async aqui só para padronizar a interface) ----------
const mmkv = createMMKV({ id: 'bench-pure-mmkv' });

export const mmkvAdapter: StorageAdapter = {
  name: 'MMKV',
  async setBlob(items) {
    mmkv.set(BLOB_KEY, JSON.stringify(items));
  },
  async getBlob() {
    return JSON.parse(mmkv.getString(BLOB_KEY) ?? '[]');
  },
  async setEach(items) {
    for (const item of items) mmkv.set(itemKey(item.name), JSON.stringify(item));
  },
  async getEach(names) {
    const out: CartItem[] = [];
    for (const n of names) {
      const v = mmkv.getString(itemKey(n));
      if (v) out.push(JSON.parse(v));
    }
    return out;
  },
  async clear() {
    mmkv.clearAll();
  },
};

// ---------- AsyncStorage ----------
export const asyncStorageAdapter: StorageAdapter = {
  name: 'AsyncStorage',
  async setBlob(items) {
    await AsyncStorage.setItem(BLOB_KEY, JSON.stringify(items));
  },
  async getBlob() {
    return JSON.parse((await AsyncStorage.getItem(BLOB_KEY)) ?? '[]');
  },
  async setEach(items) {
    for (const item of items) {
      await AsyncStorage.setItem(itemKey(item.name), JSON.stringify(item));
    }
  },
  async getEach(names) {
    const out: CartItem[] = [];
    for (const n of names) {
      const v = await AsyncStorage.getItem(itemKey(n));
      if (v) out.push(JSON.parse(v));
    }
    return out;
  },
  async clear() {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
  },
};

// ---------- Expo SQLite ----------
const sqliteSet = (key: string, value: string) =>
  db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', key, value);

const sqliteGet = async (key: string) =>
  (await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', key))?.value;

export const sqliteAdapter: StorageAdapter = {
  name: 'SQLite',
  async setBlob(items) {
    await sqliteSet(BLOB_KEY, JSON.stringify(items));
  },
  async getBlob() {
    return JSON.parse((await sqliteGet(BLOB_KEY)) ?? '[]');
  },
  async setEach(items) {
    for (const item of items) await sqliteSet(itemKey(item.name), JSON.stringify(item));
  },
  async getEach(names) {
    const out: CartItem[] = [];
    for (const n of names) {
      const v = await sqliteGet(itemKey(n));
      if (v) out.push(JSON.parse(v));
    }
    return out;
  },
  async clear() {
    await db.runAsync('DELETE FROM kv WHERE key LIKE ?', `${PREFIX}%`);
  },
};

// ---------- Expo SQLite com transação (bônus: mostra o ganho de batching) ----------
export const sqliteTxAdapter: StorageAdapter = {
  ...sqliteAdapter,
  name: 'SQLite (transaction)',
  async setEach(items) {
    await db.withTransactionAsync(async () => {
      for (const item of items) await sqliteSet(itemKey(item.name), JSON.stringify(item));
    });
  },
};

export const pureAdapters: StorageAdapter[] = [
  mmkvAdapter,
  asyncStorageAdapter,
  sqliteAdapter,
  sqliteTxAdapter,
];