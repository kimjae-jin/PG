import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = path.resolve(process.cwd(), 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);
db.run("ALTER TABLE companies ADD COLUMN treasurerName TEXT", (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            console.log("✅ treasurerName 컬럼이 이미 존재합니다.");
        } else {
            console.error("❌ 컬럼 추가 실패:", err.message);
        }
    } else {
        console.log("🎉 companies 테이블에 treasurerName 컬럼이 성공적으로 추가되었습니다.");
    }
    db.close();
});