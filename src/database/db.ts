import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './migrations';

let instance: SQLite.SQLiteDatabase | null = null;

export function openDb(): SQLite.SQLiteDatabase {
  if (instance) return instance;
  const db = SQLite.openDatabaseSync('dossier9.db');
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  instance = db;
  return db;
}

export async function runMigrations(): Promise<number> {
  const db = openDb();
  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );`
  );
  const applied = await db.getAllAsync<{ version: number }>('SELECT version FROM migrations');
  const appliedSet = new Set(applied.map((r) => r.version));
  let count = 0;
  for (const migration of MIGRATIONS) {
    if (appliedSet.has(migration.version)) continue;
    await db.withTransactionAsync(async () => {
      for (const stmt of migration.up) {
        await db.execAsync(stmt);
      }
      await db.runAsync('INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)', [
        migration.version,
        migration.name,
        new Date().toISOString(),
      ]);
    });
    count += 1;
  }
  return count;
}
