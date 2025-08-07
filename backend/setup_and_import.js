import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');
const DB_BACKUP_PATH = path.join(__dirname, `database.db.bak.${Date.now()}`);
const DATA_MIGRATION_DIR = path.join(__dirname, '..', 'data_migration');
const EMPLOYEES_FILE = path.join(DATA_MIGRATION_DIR, 'employees_master.json');
const INVOICES_FILE = path.join(DATA_MIGRATION_DIR, 'invoices_master.json');

const runAsync = (db, query, params = []) => new Promise((resolve, reject) => {
    db.run(query, params, function(err) { if (err) reject(err); else resolve(this); });
});

async function main() {
    console.log("==============================================");
    console.log("   제네시스 재림: 통합 재구축 및 이식 프로토콜   ");
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
        console.log("\n🚀 Phase 1: 스키마 구축 시작");
        const createQueries = [
            `CREATE TABLE Projects ( projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectNo TEXT UNIQUE, projectName TEXT, clientName TEXT, totalAmount REAL, equityAmount REAL, startDate DATE, contractDate DATE );`,
            `CREATE TABLE Companies ( companyId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, registrationNumber TEXT UNIQUE, address TEXT, ceoName TEXT );`,
            `CREATE TABLE Employees ( employeeId TEXT PRIMARY KEY, name TEXT NOT NULL, dateOfBirth DATE, emergencyContact TEXT, email TEXT, address TEXT, hireDate DATE, department TEXT, position TEXT, status TEXT DEFAULT '재직' );`,
            // ---------- [수정된 라인] ----------
            `CREATE TABLE Invoices ( invoiceId INTEGER PRIMARY KEY AUTOINCREMENT, approvalNo TEXT NOT NULL UNIQUE, clientRegNo TEXT, clientName TEXT, issueDate DATE, totalAmount REAL, projectId INTEGER, FOREIGN KEY (projectId) REFERENCES Projects(projectId) );`,
            // ------------------------------------
            `CREATE TABLE InvoiceItems ( itemId INTEGER PRIMARY KEY AUTOINCREMENT, invoiceId INTEGER NOT NULL, itemName TEXT, supplyAmount REAL, taxAmount REAL, FOREIGN KEY (invoiceId) REFERENCES Invoices (invoiceId) );`
        ];
        for (const query of createQueries) await runAsync(db, query);
        console.log(`✅ 모든 테이블 스키마 생성 완료.`);

        console.log("\n🚀 Phase 2: 데이터 이식 시작");
        
        const projects = projectsData.filter(p => p.project_number);
        const projectStmt = db.prepare("INSERT OR IGNORE INTO Projects (projectNo, projectName, clientName, totalAmount, equityAmount, startDate, contractDate) VALUES (?, ?, ?, ?, ?, ?, ?)");
        for (const p of projects) await new Promise(res => projectStmt.run([p.project_number, p.project_name, p.client_name, p.total_amount, p.equity_amount, p.start_date, p.contract_date], res));
        projectStmt.finalize();
        console.log(`✅ 프로젝트 정보 ${projects.length}건 이식 완료.`);

        const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8'));
        const companyStmt = db.prepare("INSERT OR IGNORE INTO Companies (name, registrationNumber) VALUES (?, ?)");
        const invoiceStmt = db.prepare("INSERT OR IGNORE INTO Invoices (approvalNo, clientRegNo, clientName, issueDate, totalAmount) VALUES (?, ?, ?, ?, ?)");
        const itemStmt = db.prepare("INSERT INTO InvoiceItems (invoiceId, itemName, supplyAmount, taxAmount) VALUES (?, ?, ?, ?)");
        
        const companies = new Map();
        invoices.forEach(inv => { if (inv.client_reg_no) companies.set(inv.client_reg_no, inv.client_name); });
        for (const [regNo, name] of companies.entries()) await new Promise(res => companyStmt.run([name, regNo], res));
        companyStmt.finalize();
        console.log(`✅ 관계사 정보 ${companies.size}건 이식 완료.`);

        for (const inv of invoices) {
            const result = await new Promise((res, rej) => invoiceStmt.run([inv.approval_no, inv.client_reg_no, inv.client_name, inv.issue_date, inv.total_amount], function(err){ if(err) rej(err); else res(this);}));
            if (result.changes > 0) {
                const invoiceId = result.lastID;
                for (const item of inv.items) await new Promise(res => itemStmt.run([invoiceId, item.item_name, item.supply_amount, item.tax_amount], res));
            }
        }
        invoiceStmt.finalize();
        itemStmt.finalize();
        console.log(`✅ 세금계산서 정보 이식 완료.`);

        const employees = JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
        const empStmt = db.prepare("INSERT OR IGNORE INTO Employees (employeeId, name, dateOfBirth, emergencyContact, email, address, hireDate, department, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const emp of employees) await new Promise(res => empStmt.run([emp.employeeId, emp.name, emp.dateOfBirth, emp.emergencyContact, emp.email, emp.address, emp.hireDate, emp.department, emp.position], res));
        empStmt.finalize();
        console.log(`✅ 사원 정보 ${employees.length}건 이식 완료.`);

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