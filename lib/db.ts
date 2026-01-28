import Database from "better-sqlite3";
import path from "path";

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "db", "journals.db");

// Ensure db directory exists
import fs from "fs";
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

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

// Prepared statements for performance
export const statements = {
  insert: db.prepare(
    "INSERT OR REPLACE INTO journals (filename, date, title, text, categories, timestamp, pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ),
  selectAll: db.prepare("SELECT * FROM journals ORDER BY timestamp DESC"),
  selectByFilename: db.prepare("SELECT * FROM journals WHERE filename = ?"),
  update: db.prepare(
    "UPDATE journals SET date = ?, title = ?, text = ?, categories = ?, pinned = ? WHERE filename = ?",
  ),
  delete: db.prepare("DELETE FROM journals WHERE filename = ?"),
  togglePinned: db.prepare(
    "UPDATE journals SET pinned = CASE WHEN pinned = 1 THEN 0 ELSE 1 END WHERE filename = ?",
  ),
};

export default db;
