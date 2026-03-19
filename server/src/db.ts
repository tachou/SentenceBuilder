import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'sentence-builder.db');

let db: SqlJsDatabase;

export async function initDb(): Promise<void> {
  const SQL = await initSqlJs();

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  runMigrations();
  persist();
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export function persist(): void {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/** Run a query and return rows as objects */
export function query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/** Run a query and return first row or undefined */
export function queryOne<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const rows = query<T>(sql, params);
  return rows[0];
}

/** Run an INSERT/UPDATE/DELETE and return lastInsertRowid */
export function run(sql: string, params: unknown[] = []): number {
  db.run(sql, params);
  const row = queryOne<{ id: number }>('SELECT last_insert_rowid() as id');
  return row?.id ?? 0;
}

/** Run an INSERT/UPDATE/DELETE and return number of changes */
export function runChanges(sql: string, params: unknown[] = []): number {
  db.run(sql, params);
  const row = queryOne<{ c: number }>('SELECT changes() as c');
  return row?.c ?? 0;
}

function runMigrations() {
  db.run(`
    CREATE TABLE IF NOT EXISTS custom_word_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      name TEXT NOT NULL,
      language TEXT NOT NULL CHECK(language IN ('en','fr','zh-Hans')),
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(device_id, name, language)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS custom_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL REFERENCES custom_word_lists(id) ON DELETE CASCADE,
      word TEXT NOT NULL,
      pos TEXT NOT NULL CHECK(pos IN ('noun','verb','adjective','adverb','phrase','conjunction','particle','other')),
      phonetic TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS session_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      language TEXT NOT NULL,
      result TEXT,
      words_used TEXT,
      sentence TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS earned_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at TEXT DEFAULT (datetime('now')),
      UNIQUE(device_id, badge_id)
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_device ON session_events(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_events_device_date ON session_events(device_id, created_at)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_badges_device ON earned_badges(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_custom_lists_device ON custom_word_lists(device_id)`);
}
