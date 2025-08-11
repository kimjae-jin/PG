import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.db');
const db = new (sqlite3.verbose().Database)(dbPath);

const runQuery = (query) => new Promise((resolve, reject) => {
    db.run(query, (err) => err ? reject(err) : resolve());
});

const migrate = async () => {
    console.log("'Attachments' 테이블 생성을 시도합니다...");
    try {
        await runQuery(`
            CREATE TABLE IF NOT EXISTS Attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                revision_id INTEGER,
                file_path TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                mime_type TEXT,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES Projects (projectId),
                FOREIGN KEY (revision_id) REFERENCES ContractRevisions (id)
            )
        `);
        console.log("✅ 'Attachments' 테이블이 성공적으로 준비되었습니다.");
    } catch (err) {
        console.error("🔥 스키마 업데이트 실패:", err.message);
    } finally {
        db.close();
    }
};
migrate();