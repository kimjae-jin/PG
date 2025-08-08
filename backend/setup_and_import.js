import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');
const DB_BACKUP_PATH = path.join(__dirname, `database.db.bak.reconstruction.${Date.now()}`);

const runAsync = (db, query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) { if (err) reject(err); else resolve(this); });
});

async function main() {
    console.log("==============================================");
    console.log("   데이터베이스 완전 재건 프로토콜   ");
    console.log("==============================================");

    if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, DB_BACKUP_PATH);
        console.log(`🛡️  안전 조치: 기존 DB를 ${DB_BACKUP_PATH} 에 백업.`);
        fs.unlinkSync(DB_PATH);
        console.log(`🧹 대지 정화: 기존 DB 파일 삭제.`);
    }

    const db = new (sqlite3.verbose().Database)(DB_PATH);
    console.log(`🌱 새로운 데이터베이스 파일 생성 완료.`);

    try {
        await runAsync(db, "BEGIN TRANSACTION;");
        console.log("\n🚀 Phase 1: 전체 테이블 스키마 구축 시작");

        await runAsync(db, `
            CREATE TABLE Projects (
                projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectNo TEXT, projectName TEXT, clientName TEXT,
                totalAmount REAL, equityAmount REAL, contractDate DATE, startDate DATE, endDate DATE,
                completionDate DATE, remarks TEXT, manager TEXT, special_notes TEXT
            );
        `);
        console.log(`  -> Projects 테이블 생성 완료.`);
        
        // --- [중요] 다른 모든 필수 테이블 스키마를 여기에 추가 ---
        // (이 부분은 다음 작전에서 확장될 수 있습니다. 우선 Projects에 집중)


        console.log("\n🚀 Phase 2: '진실'의 데이터 완벽 이식 시작");
        
        const projectStmt = db.prepare(
            `INSERT INTO Projects (projectNo, projectName, clientName, totalAmount, equityAmount, contractDate, startDate, endDate, completionDate, remarks) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );
        for (const p of projectsData) {
            await new Promise(res => projectStmt.run([
                p.project_number, p.project_name, p.client_name, p.total_amount, p.equity_amount,
                p.contract_date, p.start_date, p.end_date, p.completion_date, p.remarks
            ], res));
        }
        projectStmt.finalize();
        console.log(`  -> ${projectsData.length}건의 프로젝트 데이터 이식 완료.`);
        
        await runAsync(db, "COMMIT;");
        console.log("\n🎉 모든 데이터베이스 재창조 및 데이터 이식 완료!");
    } catch (error) {
        console.error('🔥 치명적 오류 발생! 작업을 롤백합니다:', error);
        await runAsync(db, "ROLLBACK;");
    } finally {
        db.close(() => console.log('🔌 데이터베이스 연결이 안전하게 종료되었습니다.'));
    }
}

main();
