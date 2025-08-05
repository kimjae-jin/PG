import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = path.resolve(process.cwd(), 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

db.serialize(() => {
    console.log("🚀 '불변 식별자' 원칙에 따라 Invoices 스키마 재구축을 시작합니다...");
    
    // 1. 기존 테이블이 있다면 안전하게 삭제
    db.run("DROP TABLE IF EXISTS InvoiceItems;");
    db.run("DROP TABLE IF EXISTS Invoices;");
    
    // 2. 새로운 'Invoices' 마스터 테이블 생성
    db.run(`
        CREATE TABLE Invoices (
            invoiceId INTEGER PRIMARY KEY AUTOINCREMENT,
            approvalNo TEXT NOT NULL UNIQUE,
            issueDate DATE,
            supplierRegNo TEXT, -- 공급자 사업자등록번호
            supplierName TEXT,  -- 공급자 상호 (기록 시점의 이름)
            clientRegNo TEXT,   -- 공급받는자 사업자등록번호 (핵심 식별자)
            clientName TEXT,    -- 공급받는자 상호 (기록 시점의 이름)
            totalAmount REAL,
            supplyTotal REAL,
            taxTotal REAL
        );`, (err) => {
            if (err) console.error("❌ Invoices 테이블 생성 실패:", err.message);
            else console.log("✅ Invoices 테이블 생성 성공.");
        });

    // 3. 새로운 'InvoiceItems' 품목 테이블 생성
    db.run(`
        CREATE TABLE InvoiceItems (
            itemId INTEGER PRIMARY KEY AUTOINCREMENT,
            invoiceId INTEGER NOT NULL,
            itemDate DATE,
            itemName TEXT,
            supplyAmount REAL,
            taxAmount REAL,
            itemRemarks TEXT,
            FOREIGN KEY (invoiceId) REFERENCES Invoices (invoiceId)
        );`, (err) => {
            if (err) console.error("❌ InvoiceItems 테이블 생성 실패:", err.message);
            else console.log("✅ InvoiceItems 테이블 생성 성공.");
        });
        
    console.log("🎉 'Invoices' 및 'InvoiceItems' 테이블 재구축 완료!");
});

db.close();