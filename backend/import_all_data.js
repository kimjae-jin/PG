import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');
const DATA_MIGRATION_DIR = path.join(__dirname, '..', 'data_migration');
const EMPLOYEES_FILE = path.join(DATA_MIGRATION_DIR, 'employees_master.json');
const INVOICES_FILE = path.join(DATA_MIGRATION_DIR, 'invoices_master.json');

const db = new (sqlite3.verbose().Database)(DB_PATH);

const runAsync = (stmt, params) => new Promise((resolve, reject) => stmt.run(params, function(err) { if (err) reject(err); else resolve(this); }));
const allAsync = (query, params = []) => new Promise((resolve, reject) => db.all(query, params, (err, rows) => { if(err) reject(err); else resolve(rows); }));

async function importProjects() {
    const stmt = db.prepare("INSERT INTO Projects (projectNo, category, projectName, client, totalAmount, equityAmount, contractDate, startDate, endDate, completionDate, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const p of projectsData) {
        await runAsync(stmt, [p.project_number, p.category, p.project_name, p.client_name, p.total_amount, p.equity_amount, p.contract_date, p.start_date, p.end_date, p.completion_date, p.remarks]);
    }
    stmt.finalize();
    console.log(`✅ ${projectsData.length}건의 프로젝트 정보 이식 완료.`);
}

async function importCompaniesAndInvoices() {
    const invoices = JSON.parse(fs.readFileSync(INVOICES_FILE, 'utf-8'));
    const companyStmt = db.prepare("INSERT OR IGNORE INTO Companies (name, registrationNumber) VALUES (?, ?)");
    const invoiceStmt = db.prepare("INSERT OR IGNORE INTO Invoices (approvalNo, clientRegNo, issueDate, totalAmount) VALUES (?, ?, ?, ?)");
    const itemStmt = db.prepare("INSERT INTO InvoiceItems (invoiceId, itemDate, itemName, supplyAmount, taxAmount) VALUES (?, ?, ?, ?, ?)");

    const companies = new Map();
    invoices.forEach(inv => {
        if (inv.client_reg_no && !companies.has(inv.client_reg_no)) {
            companies.set(inv.client_reg_no, inv.client_name);
        }
    });

    for (const [regNo, name] of companies.entries()) {
        await runAsync(companyStmt, [name, regNo]);
    }
    console.log(`✅ ${companies.size}개의 관계사 정보 (세금계산서 기반) 이식 완료.`);
    
    for (const inv of invoices) {
        const result = await runAsync(invoiceStmt, [inv.approval_no, inv.client_reg_no, inv.issue_date, inv.total_amount]);
        if (result.changes > 0) {
            const invoiceId = result.lastID;
            for (const item of inv.items) {
                await runAsync(itemStmt, [invoiceId, item.item_date, item.item_name, item.supply_amount, item.tax_amount]);
            }
        }
    }
    companyStmt.finalize();
    invoiceStmt.finalize();
    itemStmt.finalize();
    console.log(`✅ ${invoices.length}건의 세금계산서 정보 (품목 포함) 이식 완료.`);
}

async function importEmployees() {
    const employees = JSON.parse(fs.readFileSync(EMPLOYEES_FILE, 'utf-8'));
    const stmt = db.prepare("INSERT INTO Employees (employeeId, name, dateOfBirth, emergencyContact, email, address, hireDate, department, position, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const emp of employees) {
        await runAsync(stmt, [emp.employeeId, emp.name, emp.dateOfBirth, emp.emergencyContact, emp.email, emp.address, emp.hireDate, emp.department, emp.position, emp.status || '재직']);
    }
    stmt.finalize();
    console.log(`✅ ${employees.length}명의 사원 정보 이식 완료.`);
}

async function main() {
    console.log("========================================");
    console.log("   제네시스 재림 Phase 2: 데이터 이식 시작   ");
    console.log("========================================");
    db.serialize(async () => {
        await runAsync("BEGIN TRANSACTION;");
        try {
            await importProjects();
            await importCompaniesAndInvoices();
            await importEmployees();
            await runAsync("COMMIT;");
            console.log('🎉 모든 데이터 이식 완료! 시스템이 새로운 생명을 얻었습니다.');
        } catch (error) {
            await runAsync("ROLLBACK;");
            console.error('🔥 최종 이식 과정에서 오류가 발생했습니다:', error.message);
        } finally {
            db.close(() => console.log('🔌 데이터베이스 연결이 안전하게 종료되었습니다.'));
        }
    });
}

main();