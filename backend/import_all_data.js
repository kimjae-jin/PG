import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');
const DATA_MIGRATION_DIR = path.join(__dirname, '..', 'data_migration');
const EMPLOYEES_MASTER_FILE = path.join(DATA_MIGRATION_DIR, 'employees_master.json');
const INVOICES_MASTER_FILE = path.join(DATA_MIGRATION_DIR, 'invoices_master.json');

const db = new (sqlite3.verbose().Database)(DB_PATH);

const runAsync = (stmt, params) => new Promise((resolve, reject) => stmt.run(params, function(err) { if (err) reject(err); else resolve(this); }));

async function importAllData() {
    console.log("========================================");
    console.log("   제네시스 재림 Phase 2: 데이터 이식 시작   ");
    console.log("========================================");
    
    db.serialize(async () => {
        try {
            await new Promise((res, rej) => db.run("BEGIN TRANSACTION;", (err) => err ? rej(err) : res()));
            
            // 1. 프로젝트
            if (projectsData) {
                const projectStmt = db.prepare("INSERT OR IGNORE INTO Projects (projectNo, projectName, clientName, totalAmount, equityAmount, startDate) VALUES (?, ?, ?, ?, ?, ?)");
                for (const p of projectsData.filter(p => p.project_number)) {
                    await runAsync(projectStmt, [p.project_number, p.project_name, p.client_name, p.total_amount, p.equity_amount, p.start_date]);
                }
                projectStmt.finalize();
                console.log(`✅ 프로젝트 정보 이식 완료.`);
            }

            // 2. 관계사 & 세금계산서
            if (fs.existsSync(INVOICES_MASTER_FILE)) {
                const invoices = JSON.parse(fs.readFileSync(INVOICES_MASTER_FILE, 'utf-8'));
                const companyStmt = db.prepare("INSERT OR IGNORE INTO Companies (name, registrationNumber) VALUES (?, ?)");
                const invoiceStmt = db.prepare("INSERT OR IGNORE INTO Invoices (approvalNo, clientRegNo, clientName, issueDate, totalAmount) VALUES (?, ?, ?, ?, ?)");
                const itemStmt = db.prepare("INSERT INTO InvoiceItems (invoiceId, itemName, supplyAmount, taxAmount) VALUES (?, ?, ?, ?)");
                
                const companies = new Map();
                invoices.forEach(inv => { if (inv.client_reg_no) companies.set(inv.client_reg_no, inv.client_name); });
                for (const [regNo, name] of companies.entries()) await runAsync(companyStmt, [name, regNo]);
                companyStmt.finalize();
                console.log(`✅ 관계사 정보 이식 완료.`);

                for (const inv of invoices) {
                    const result = await runAsync(invoiceStmt, [inv.approval_no, inv.client_reg_no, inv.client_name, inv.issue_date, inv.total_amount]);
                    if (result.changes > 0) {
                        const invoiceId = result.lastID;
                        for (const item of inv.items) await runAsync(itemStmt, [invoiceId, item.item_name, item.supply_amount, item.tax_amount]);
                    }
                }
                invoiceStmt.finalize();
                itemStmt.finalize();
                console.log(`✅ 세금계산서 정보 이식 완료.`);
            }

            // 3. 기술인
            if (fs.existsSync(EMPLOYEES_MASTER_FILE)) {
                const employees = JSON.parse(fs.readFileSync(EMPLOYEES_MASTER_FILE, 'utf-8'));
                const empStmt = db.prepare("INSERT OR IGNORE INTO Employees (employeeId, name, hireDate, department, position) VALUES (?, ?, ?, ?, ?)");
                for (const emp of employees) await runAsync(empStmt, [emp.employeeId, emp.name, emp.hireDate, emp.department, emp.position]);
                empStmt.finalize();
                console.log(`✅ 사원 정보 이식 완료.`);
            }

            await new Promise((res, rej) => db.run("COMMIT;", (err) => err ? rej(err) : res()));
            console.log('🎉 모든 데이터 이식 완료!');

        } catch (error) {
            console.error('🔥 최종 이식 과정에서 오류가 발생했습니다:', error.message);
            await new Promise((res, rej) => db.run("ROLLBACK;", (err) => err ? rej(err) : res()));
        } finally {
            db.close(() => console.log('🔌 데이터베이스 연결이 안전하게 종료되었습니다.'));
        }
    });
}

importAllData();