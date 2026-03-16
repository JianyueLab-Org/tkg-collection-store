import Database from "better-sqlite3";
import { env } from "$env/dynamic/private";

const dbPath = env.DATABASE_PATH || "local.db";
const db = new Database(dbPath, { verbose: console.log });

// 初始化用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
