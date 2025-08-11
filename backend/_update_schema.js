import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.db');
const db = new (sqlite3.verbose().Database)(dbPath);

const runQuery = (query) => new Promise((resolve, reject) => {
    db.run(query, function(err) {
        if (err) {
            if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
                console.log(`- 경고: ${err.message}. 이미 적용된 변경입니다.`);
                resolve();
            } else {
                reject(err);
            }
        } else {
            resolve();
        }
    });
});

const migrate = async () => {
    console.log("데이터베이스 스키마 통합 업데이트를 시작합니다...");
    try {
        // --- 생명주기 관리 스키마 ---
        console.log("\n[Phase 1] 생명주기 관리 스키마 적용 중...");
        await runQuery(`ALTER TABLE Projects ADD COLUMN current_status TEXT`);
        await runQuery(`ALTER TABLE Projects ADD COLUMN status_change_date DATE`);
        await runQuery(`CREATE TABLE IF NOT EXISTS ContractRevisions (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, revision_type TEXT, reason TEXT, createdAt DATETIME)`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN status_change_date DATE`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN contract_date DATE`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN start_date DATE`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN end_date DATE`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN total_equity_amount INTEGER`);
        await runQuery(`ALTER TABLE ContractRevisions ADD COLUMN remarks TEXT`);
        console.log("...생명주기 관리 스키마 적용 완료.");

        // --- 증빙서류 관리 스키마 ---
        console.log("\n[Phase 2] 증빙서류 관리 스키마 적용 중...");
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
        console.log("...증빙서류 관리 스키마 적용 완료.");
        
        console.log("\n✅ 모든 스키마 업데이트가 성공적으로 완료되었습니다.");
    } catch (err) {
        console.error("🔥 스키마 업데이트 실패:", err.message);
    } finally {
        db.close();
        console.log("데이터베이스 연결이 종료되었습니다.");
    }
};

migrate();