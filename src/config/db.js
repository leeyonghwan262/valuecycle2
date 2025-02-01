// src/config/db.js
const path = require('path');
const Database = require('better-sqlite3');

// 1) DB 파일 경로
const dbPath = path.join(__dirname, 'my-database.db');
console.log('Using DB file:', dbPath);

const db = new Database(dbPath);

// 2) users 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    coin_balance INTEGER DEFAULT 0
  );
`);

// 3) spent_coins 컬럼이 없으면 추가
try {
  db.exec(`
    ALTER TABLE users
    ADD COLUMN spent_coins INTEGER DEFAULT 0
  `);
  console.log("spent_coins 칼럼을 추가했습니다.");
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log("spent_coins 칼럼이 이미 존재합니다. (문제 없음)");
  } else {
    console.log("ALTER TABLE 에러:", err.message);
  }
}

// 4) history 테이블 생성 (코인 사용/충전/할당 기록)
db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cost INTEGER NOT NULL,      -- 사용/충전/할당된 양. 양수로만 기록
    reason TEXT,                -- 'USE', 'CHARGE', 'ASSIGN' 등
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// 5) 샘플 사용자 INSERT - OR REPLACE
db.exec(`
  INSERT OR REPLACE INTO users (username, coin_balance, spent_coins)
  VALUES
    ('young-woo1-15', 1000, 0),
    ('bo-ram-12',     1000, 0),
    ('joo-eul-11',    1000, 0),
    ('sarah-51',      1000, 0),
    ('hyung-bae-34',  1000, 0),
    ('jin-hee-11',    1000, 0),
    ('system-61',     1000, 0),
    ('7794',          10000, 0)
`);

module.exports = db;
