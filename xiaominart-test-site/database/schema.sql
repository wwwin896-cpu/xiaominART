-- xiaominART test site SQLite schema reference
-- Runtime creates the same schema automatically on first start.
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, access_token TEXT UNIQUE NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS custom_requests (id TEXT PRIMARY KEY, request_number TEXT UNIQUE NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, name TEXT NOT NULL, metadata TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS idempotency (kind TEXT NOT NULL, idem_key TEXT NOT NULL, digest TEXT NOT NULL, response_status INTEGER NOT NULL, response_body TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(kind, idem_key));
