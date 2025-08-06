import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'backend', 'database.db');
const DB_BACKUP_PATH = path.resolve(process.cwd(), 'backend', `database.db.bak.${Date.now()}`);

const queries = [
    `CREATE TABLE Projects ( projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectNo TEXT UNIQUE, category TEXT, projectName TEXT, clientName TEXT, totalAmount REAL, equityAmount REAL, contractDate DATE, startDate DATE, endDate DATE, completionDate DATE, remarks TEXT );`,
    `CREATE TABLE Companies ( companyId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, registrationNumber TEXT UNIQUE, address TEXT, ceoName TEXT );`,
    `CREATE TABLE Employees ( employeeId TEXT PRIMARY KEY, name TEXT NOT NULL, dateOfBirth DATE, emergencyContact TEXT, email TEXT, address TEXT, hireDate DATE, department TEXT, position TEXT, status TEXT );`,
    `CREATE TABLE Invoices ( invoiceId INTEGER PRIMARY KEY AUTOINCREMENT, approvalNo TEXT NOT NULL UNIQUE, clientRegNo TEXT, clientName TEXT, issueDate DATE, totalAmount REAL );`,
    `CREATE TABLE InvoiceItems ( itemId INTEGER PRIMARY KEY AUTOINCREMENT, invoiceId INTEGER NOT NULL, itemName TEXT, supplyAmount REAL, taxAmount REAL, FOREIGN KEY (invoiceId) REFERENCES Invoices (invoiceId) );`
];

function setupDatabase() {
    console.log("==============================================");
    console.log("   제네시스 재림 Phase 1: 데이터베이스 재창조 시작   ");
    console.log("==============================================");
    if (fs.existsSync(DB_PATH)) {
        fs.copyFileSync(DB_PATH, DB_BACKUP_PATH);
        console.log(`🛡️  안전 조치: 기존 데이터베이스를 ${DB_BACKUP_PATH} 에 백업했습니다.`);
        fs.unlinkSync(DB_PATH);
        console.log(`🧹 대지 정화: 기존 데이터베이스 파일을 삭제했습니다.`);
    }
    const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
        if (err) return console.error(`❌ DB 파일 생성 실패: ${err.message}`);
        console.log(`🌱 새로운 데이터베이스 파일 '${DB_PATH}'가 성공적으로 생성되었습니다.`);
        db.serialize(() => {
            queries.forEach(query => {
                db.run(query, (err) => {
                    if (err) console.error(`❌ 테이블 생성 실패: ${query.substring(0,40)}...`, err.message);
                    else console.log(`✅ 테이블 생성 성공: ${query.match(/CREATE TABLE (\w+)/)[1]}`);
                });
            });
            db.close((err) => {
                if (err) console.error('❌ DB 연결 종료 실패:', err.message);
                else console.log('🎉 데이터베이스 재창조 완료!');
            });
        });
    });
}
setupDatabase();