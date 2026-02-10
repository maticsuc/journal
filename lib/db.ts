import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "db", "journals.db");

let db: Database.Database | null = null;
let statements: any = null;

// Lazy initialization - only create DB when first accessed
function getDb() {
  if (db) return db;

  // Ensure db directory exists
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Enable WAL mode for better concurrency
  db.pragma("journal_mode = WAL");

  // Create table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT UNIQUE,
      date TEXT,
      title TEXT,
      text TEXT,
      categories TEXT, -- JSON string
      timestamp INTEGER,
      pinned INTEGER DEFAULT 0
    )
  `);

  return db;
}

// Lazy initialization for prepared statements
function getStatements() {
  if (statements) return statements;

  const database = getDb();

  statements = {
    insert: database.prepare(
      "INSERT OR REPLACE INTO journals (filename, date, title, text, categories, timestamp, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ),
    selectAll: database.prepare("SELECT * FROM journals ORDER BY timestamp DESC"),
    selectByFilename: database.prepare("SELECT * FROM journals WHERE filename = ?"),
    update: database.prepare(
      "UPDATE journals SET date = ?, title = ?, text = ?, categories = ?, pinned = ? WHERE filename = ?",
    ),
    delete: database.prepare("DELETE FROM journals WHERE filename = ?"),
    togglePinned: database.prepare(
      "UPDATE journals SET pinned = CASE WHEN pinned = 1 THEN 0 ELSE 1 END WHERE filename = ?",
    ),
  };

  return statements;
}

export { getDb as default, getStatements as statements };
