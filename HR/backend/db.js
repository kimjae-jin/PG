// [HR/backend/db.js]
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'database.db'); // HR 폴더 루트의 DB
const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
  if (err) { console.error('🔥 데이터베이스 연결 실패:', err.message); } 
  else { console.log('> 데이터베이스가 성공적으로 연결되었습니다.'); }
});
export default db;