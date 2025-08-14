const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.db');

if (fs.existsSync(DB_FILE)) {
    console.log(`[INFO] 기존 데이터베이스 파일(${DB_FILE})을 삭제하고 다시 생성합니다.`);
    fs.unlinkSync(DB_FILE);
}

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        return console.error('[ERROR] 데이터베이스 연결에 실패했습니다:', err.message);
    }
    console.log(`[SUCCESS] SQLite 데이터베이스에 성공적으로 연결되었습니다: ${DB_FILE}`);
});

const createTableStatements = [
    `CREATE TABLE Companies (
         company_id INTEGER PRIMARY KEY AUTOINCREMENT,
         company_name TEXT NOT NULL UNIQUE,
         company_type TEXT NOT NULL CHECK(company_type IN ('CLIENT', 'COMPETITOR', 'PARTNER', 'INTERNAL')),
         business_registration_number TEXT UNIQUE,
         ceo_name TEXT,
         address TEXT,
         phone_number TEXT,
         email TEXT,
         created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
     );`,
    `CREATE TABLE CompanyLicenses (
         license_id INTEGER PRIMARY KEY AUTOINCREMENT,
         company_id INTEGER NOT NULL,
         license_name TEXT NOT NULL,
         license_number TEXT UNIQUE,
         issue_date TEXT,
         expiry_date TEXT,
         issuer TEXT,
         created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
         FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE Technicians (
         technician_id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         resident_registration_number TEXT UNIQUE,
         phone_number TEXT,
         email TEXT UNIQUE,
         address TEXT,
         hire_date TEXT,
         employment_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(employment_status IN ('ACTIVE', 'INACTIVE', 'RETIRED')),
         created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
     );`,
    `CREATE TABLE Qualifications (
         qualification_id INTEGER PRIMARY KEY AUTOINCREMENT,
         technician_id INTEGER NOT NULL,
         qualification_name TEXT NOT NULL,
         qualification_number TEXT,
         issuer TEXT,
         issue_date TEXT,
         expiry_date TEXT,
         FOREIGN KEY (technician_id) REFERENCES Technicians(technician_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE Trainings (
         training_id INTEGER PRIMARY KEY AUTOINCREMENT,
         technician_id INTEGER NOT NULL,
         training_name TEXT NOT NULL,
         institution TEXT,
         start_date TEXT,
         end_date TEXT,
         completion_status TEXT DEFAULT 'COMPLETED' CHECK(completion_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED')),
         FOREIGN KEY (technician_id) REFERENCES Technicians(technician_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE Projects (
         project_id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_name TEXT NOT NULL,
         project_code TEXT UNIQUE,
         client_company_id INTEGER,
         project_status TEXT NOT NULL CHECK(project_status IN ('PLANNING', 'BIDDING', 'ONGOING', 'COMPLETED', 'DROPPED')),
         start_date TEXT,
         end_date TEXT,
         description TEXT,
         created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
         FOREIGN KEY (client_company_id) REFERENCES Companies(company_id) ON DELETE SET NULL
     );`,
    `CREATE TABLE Quotations (
        quotation_id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER UNIQUE,
        client_company_id INTEGER NOT NULL,
        quotation_number TEXT NOT NULL UNIQUE,
        quotation_date TEXT NOT NULL,
        total_amount REAL NOT NULL,
        validity_period_days INTEGER DEFAULT 30,
        status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED')),
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
        FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE SET NULL,
        FOREIGN KEY (client_company_id) REFERENCES Companies(company_id) ON DELETE RESTRICT
     );`,
    `CREATE TABLE QuotationItems (
        item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        quotation_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        description TEXT,
        quantity REAL NOT NULL,
        unit TEXT,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (quotation_id) REFERENCES Quotations(quotation_id) ON DELETE CASCADE
    );`,
    `CREATE TABLE Contracts (
         contract_id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER NOT NULL UNIQUE,
         quotation_id INTEGER UNIQUE,
         contract_date TEXT NOT NULL,
         contract_amount REAL NOT NULL,
         vat_included INTEGER NOT NULL DEFAULT 1 CHECK(vat_included IN (0, 1)),
         contract_period_start TEXT,
         contract_period_end TEXT,
         payment_terms TEXT,
         status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'COMPLETED', 'TERMINATED')),
         FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE,
         FOREIGN KEY (quotation_id) REFERENCES Quotations(quotation_id) ON DELETE SET NULL
     );`,
    `CREATE TABLE ContractRevisions (
        revision_id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        revision_date TEXT NOT NULL,
        revised_amount REAL,
        reason TEXT NOT NULL,
        description TEXT,
        FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id) ON DELETE CASCADE
    );`,
    `CREATE TABLE ContractEvents (
        event_id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        event_type TEXT NOT NULL CHECK(event_type IN ('MILESTONE', 'NOTICE', 'CHANGE_ORDER', 'OTHER')),
        event_date TEXT NOT NULL,
        description TEXT NOT NULL,
        is_critical INTEGER DEFAULT 0,
        FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id) ON DELETE CASCADE
    );`,
    `CREATE TABLE Financials (
        financial_id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER NOT NULL,
        transaction_type TEXT NOT NULL CHECK(transaction_type IN ('INVOICE', 'PAYMENT')),
        transaction_date TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        due_date TEXT,
        related_invoice_id INTEGER,
        FOREIGN KEY (contract_id) REFERENCES Contracts(contract_id) ON DELETE RESTRICT
    );`,
    `CREATE TABLE Bids (
         bid_id INTEGER PRIMARY KEY AUTOINCREMENT,
         project_id INTEGER NOT NULL UNIQUE,
         bid_type TEXT NOT NULL DEFAULT 'BID' CHECK(bid_type IN ('BID', 'PQ')),
         announcement_date TEXT,
         submission_deadline TEXT,
         estimated_amount REAL,
         submission_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(submission_status IN ('PENDING', 'SUBMITTED', 'SUCCESS', 'FAILED')),
         result_date TEXT,
         notes TEXT,
         FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE PQ_Criteria (
        pq_criteria_id INTEGER PRIMARY KEY AUTOINCREMENT,
        bid_id INTEGER NOT NULL,
        criteria_name TEXT NOT NULL,
        max_score REAL NOT NULL,
        our_score REAL,
        evaluation_notes TEXT,
        FOREIGN KEY (bid_id) REFERENCES Bids(bid_id) ON DELETE CASCADE
    );`,
    `CREATE TABLE Bid_Competitors (
         bid_id INTEGER NOT NULL,
         company_id INTEGER NOT NULL,
         bid_price REAL,
         is_winner INTEGER DEFAULT 0 CHECK(is_winner IN (0, 1)),
         PRIMARY KEY (bid_id, company_id),
         FOREIGN KEY (bid_id) REFERENCES Bids(bid_id) ON DELETE CASCADE,
         FOREIGN KEY (company_id) REFERENCES Companies(company_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE CareerRecords (
         career_id INTEGER PRIMARY KEY AUTOINCREMENT,
         technician_id INTEGER NOT NULL,
         project_id INTEGER NOT NULL,
         participation_field TEXT NOT NULL,
         assigned_task TEXT NOT NULL,
         role TEXT NOT NULL,
         participation_start_date TEXT NOT NULL,
         participation_end_date TEXT NOT NULL,
         FOREIGN KEY (technician_id) REFERENCES Technicians(technician_id) ON DELETE CASCADE,
         FOREIGN KEY (project_id) REFERENCES Projects(project_id) ON DELETE CASCADE
     );`,
    `CREATE TABLE Documents (
         document_id INTEGER PRIMARY KEY AUTOINCREMENT,
         related_entity TEXT NOT NULL,
         related_id INTEGER NOT NULL,
         document_name TEXT NOT NULL,
         document_type TEXT,
         file_path TEXT NOT NULL UNIQUE,
         file_size_bytes INTEGER,
         uploaded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime'))
     );`,
    `CREATE TABLE Audit_Log (
         log_id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER,
         change_timestamp TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now', 'localtime')),
         action_type TEXT NOT NULL CHECK(action_type IN ('CREATE', 'UPDATE', 'DELETE')),
         table_name TEXT NOT NULL,
         record_id INTEGER NOT NULL,
         field_name TEXT,
         old_value TEXT,
         new_value TEXT
     );`
];

db.serialize(() => {
    db.run("BEGIN TRANSACTION;");
    console.log("\n[INFO] 데이터베이스 테이블 생성을 시작합니다...");
    createTableStatements.forEach((statement, index) => {
        db.run(statement, (err) => {
            if (err) {
                const cleanStatement = statement.split('\n').filter(line => !line.trim().startsWith('--')).join(' ').trim();
                console.error(`[ERROR] 테이블 생성 실패 (구문 ${index + 1}): ${err.message}\n -> Query: ${cleanStatement}`);
            } else {
                const tableNameMatch = statement.match(/CREATE TABLE\s+(\w+)/i);
                if (tableNameMatch) {
                    console.log(`  - Table '${tableNameMatch[1]}' created successfully.`);
                }
            }
        });
    });
    db.run("COMMIT;", (err) => {
        if (err) {
            console.error("\n[ERROR] 트랜잭션 커밋에 실패했습니다:", err.message);
        } else {
            console.log("\n[SUCCESS] 모든 데이터베이스 테이블이 성공적으로 생성되었습니다.");
        }
    });
});

db.close((err) => {
    if (err) {
        return console.error('[ERROR] 데이터베이스 연결 종료에 실패했습니다:', err.message);
    }
    console.log('[SUCCESS] 데이터베이스 연결이 성공적으로 종료되었습니다.');
});
