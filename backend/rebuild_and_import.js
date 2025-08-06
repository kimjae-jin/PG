import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';
import { parse } from 'csv-parse/sync';

// --- 설정 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');
const DB_BACKUP_PATH = path.join(__dirname, `database.db.bak.${Date.now()}`);
const DATA_MIGRATION_DIR = path.join(__dirname, '..', 'data_migration');
const EMPLOYEES_RAW_FILE = path.join(DATA_MIGRATION_DIR, 'employees_raw.txt');
const INVOICES_MASTER_FILE = path.join(DATA_MIGRATION_DIR, 'invoices_master.json');

// --- Promise 기반 헬퍼 ---
const runAsync = (db, query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) { if (err) reject(err); else resolve(this); });
});
const stmtRunAsync = (stmt, params = []) => new Promise((resolve, reject) => {
    stmt.run(params, function(err) { if (err) reject(err); else resolve(this); });
});

// --- 메인 작전 프로토콜 ---
async function genesisProtocol() {
    console.log("==============================================");
    console.log("   최종 작전: 제네시스 프로토콜 가동   ");
    console.log("==============================================");

    // Phase 0: 대지 정화
    if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, DB_BACKUP_PATH);
        console.log(`🛡️  안전 조치: 기존 DB를 ${DB_BACKUP_PATH} 에 백업했습니다.`);
        fs.unlinkSync(DB_PATH);
        console.log(`🧹 대지 정화: 기존 데이터베이스 파일을 삭제했습니다.`);
    }

    const db = new (sqlite3.verbose().Database)(DB_PATH);

    try {
        await runAsync(db, "BEGIN TRANSACTION;");
        console.log("\n🚀 Phase 1: 신세계 창조 (스키마 구축)");
        const createQueries = [
            `CREATE TABLE Projects ( projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectNo TEXT UNIQUE, projectName TEXT, clientName TEXT, totalAmount REAL, equityAmount REAL, startDate DATE );`,
            `CREATE TABLE Companies ( companyId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, registrationNumber TEXT UNIQUE );`,
            `CREATE TABLE Employees ( employeeId TEXT PRIMARY KEY, name TEXT NOT NULL, dateOfBirth DATE, emergencyContact TEXT, email TEXT, address TEXT, hireDate DATE, department TEXT, position TEXT, status TEXT );`,
            `CREATE TABLE Invoices ( invoiceId INTEGER PRIMARY KEY AUTOINCREMENT, approvalNo TEXT NOT NULL UNIQUE, clientRegNo TEXT, clientName TEXT, issueDate DATE, totalAmount REAL );`,
            `CREATE TABLE InvoiceItems ( itemId INTEGER PRIMARY KEY AUTOINCREMENT, invoiceId INTEGER NOT NULL, itemName TEXT, supplyAmount REAL, taxAmount REAL, FOREIGN KEY (invoiceId) REFERENCES Invoices (invoiceId) );`
        ];
        for (const query of createQueries) {
            await runAsync(db, query);
            console.log(`✅  테이블 생성: ${query.match(/CREATE TABLE (\w+)/)[1]}`);
        }

        console.log("\n🚀 Phase 2: 생명의 이식 (데이터 삽입)");
        
        const projects = projectsData.filter(p => p.project_number);
        const projectStmt = db.prepare("INSERT OR IGNORE INTO Projects (projectNo, projectName, clientName, totalAmount, equityAmount, startDate) VALUES (?, ?, ?, ?, ?, ?)");
        for (const p of projects) await stmtRunAsync(projectStmt, [p.project_number, p.project_name, p.client_name, p.total_amount, p.equity_amount, p.start_date]);
        projectStmt.finalize();
        console.log(`✅  프로젝트 정보 이식 완료.`);

        const invoices = JSON.parse(fs.readFileSync(INVOICES_MASTER_FILE, 'utf-8'));
        const companyStmt = db.prepare("INSERT OR IGNORE INTO Companies (name, registrationNumber) VALUES (?, ?)");
        const invoiceStmt = db.prepare("INSERT OR IGNORE INTO Invoices (approvalNo, clientRegNo, clientName, issueDate, totalAmount) VALUES (?, ?, ?, ?, ?)");
        const itemStmt = db.prepare("INSERT INTO InvoiceItems (invoiceId, itemName, supplyAmount, taxAmount) VALUES (?, ?, ?, ?)");
        
        const companies = new Map();
        invoices.forEach(inv => { if (inv.client_reg_no) companies.set(inv.client_reg_no, inv.client_name); });
        for (const [regNo, name] of companies.entries()) await stmtRunAsync(companyStmt, [name, regNo]);
        companyStmt.finalize();
        console.log(`✅  관계사 정보 이식 완료.`);

        for (const inv of invoices) {
            const result = await stmtRunAsync(invoiceStmt, [inv.approval_no, inv.client_reg_no, inv.client_name, inv.issue_date, inv.total_amount]);
            if (result.changes > 0) {
                const invoiceId = result.lastID;
                for (const item of inv.items) await stmtRunAsync(itemStmt, [invoiceId, item.item_name, item.supply_amount, item.tax_amount]);
            }
        }
        invoiceStmt.finalize();
        itemStmt.finalize();
        console.log(`✅  세금계산서 정보 이식 완료.`);

        const rawEmpContent = fs.readFileSync(EMPLOYEES_RAW_FILE, 'utf-8');
        const empRecords = parse(rawEmpContent, { columns: true, skip_empty_lines: true, trim: true });
        const empStmt = db.prepare("INSERT OR IGNORE INTO Employees (employeeId, name, dateOfBirth, emergencyContact, email, address, hireDate, department, position, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const emp of empRecords) await stmtRunAsync(empStmt, [emp.사번, emp.이름, normalizeDate(emp.생년월일), emp.비상연락망, emp.이메일, emp.주소, normalizeDate(emp.입사일), emp.소속부서, emp.직책, emp.상태 || '재직']);
        empStmt.finalize();
        console.log(`✅  사원 정보 이식 완료.`);

        await runAsync(db, "COMMIT;");
        console.log("\n🎉 모든 데이터베이스 재창조 및 데이터 이식 완료!");

    } catch (error) {
        console.error('🔥 치명적 오류 발생! 작업을 롤백합니다:', error);
        await runAsync(db, "ROLLBACK;");
    } finally {
        db.close(() => console.log('🔌 데이터베이스 연결이 안전하게 종료되었습니다.'));
    }
}
const normalizeDate = (dateString) => {
    if (!dateString) return null;
    const cleaned = dateString.replace(/년|월/g, '-').replace(/일/g, '').replace(/\s/g, '');
    try {
        const date = new Date(cleaned);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    } catch(e) { return null; }
};
genesisProtocol();