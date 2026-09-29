import * as SQLite from 'expo-sqlite';
import { StateStorage } from 'zustand/middleware';

export const db = SQLite.openDatabaseSync('benchmark.db');

// Tabela chave/valor simples
db.execSync(`
  CREATE TABLE IF NOT EXISTS kv (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
`);

export const sqliteStateStorage: StateStorage = {
  getItem: async (name) => {
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM kv WHERE key = ?',
      name
    );
    return row?.value ?? null;
  },
  setItem: async (name, value) => {
    await db.runAsync(
      'INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)',
      name,
      value
    );
  },
  removeItem: async (name) => {
    await db.runAsync('DELETE FROM kv WHERE key = ?', name);
  },
};
