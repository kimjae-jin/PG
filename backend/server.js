import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const db = new (sqlite3.verbose().Database)(DB_PATH);
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const projectId = req.params.id || req.projectId;
        if (!projectId) { return cb(new Error("Project ID could not be determined for storage"), false); }
        const dir = path.join(UPLOADS_DIR, String(projectId));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + Buffer.from(file.originalname, 'latin1').toString('utf8'));
    }
});
const upload = multer({ storage: storage });

const handleDbError = (res, err, message = "Database error") => {
    console.error(`🔥 ${message.toUpperCase()}:`, err);
    res.status(500).json({ error: message, details: err.message });
}

// 1. 프로젝트 API (안정화된 버전)
app.get('/api/projects', (req, res) => {
    const sql = `
        SELECT
            p.projectId as id, p.projectNo as project_no, p.projectName as project_name, p.clientName as client,
            p.manager, p.contractDate as contract_date, p.startDate as start_date, p.endDate as end_date, p.completionDate as completion_date,
            p.totalAmount as contract_amount, p.equityAmount as equity_amount,
            COALESCE(fin.total_claimed, 0) as total_billed_amount,
            COALESCE(fin.total_paid, 0) as total_paid_amount,
            (COALESCE(p.equityAmount, 0) - COALESCE(fin.total_paid, 0)) as balance,
            COALESCE(fin.claim_count, 0) as request_count,
            -- 상태 추론 로직 안정화
            CASE 
                WHEN (
                    SELECT revision_type FROM ContractRevisions cr 
                    WHERE cr.project_id = p.projectId 
                    ORDER BY cr.status_change_date DESC, cr.id DESC LIMIT 1
                ) = '중지' THEN '중지'
                WHEN (COALESCE(p.equityAmount, 0) - COALESCE(fin.total_paid, 0)) <= 0 AND COALESCE(fin.claim_count, 0) > 0 THEN '완료'
                WHEN p.completionDate IS NOT NULL AND p.completionDate != '' THEN '완료'
                ELSE '진행중'
            END as status
        FROM Projects p
        LEFT JOIN (
            SELECT 
                projectId, 
                COUNT(id) as claim_count,
                SUM(amount) as total_claimed,
                (SELECT SUM(amount) FROM Payments WHERE projectId = Claims.projectId) as total_paid
            FROM Claims GROUP BY projectId
        ) fin ON p.projectId = fin.projectId
        ORDER BY p.startDate DESC
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err, '프로젝트 조회 실패') : res.json(rows));
});

app.get('/api/projects/:id', (req, res) => {
    // 프로젝트 상세 조회 로직
    const sql = `
        SELECT
            p.projectId as id, p.projectNo as project_no, p.projectName as project_name, p.clientName as client,
            p.manager, p.contractDate as contract_date, p.startDate as start_date, p.endDate as end_date, p.completionDate as completion_date,
            p.totalAmount as contract_amount, p.equityAmount as equity_amount
            -- 상세 페이지에서는 재무정보를 별도 API로 호출하므로 기본 정보만 제공
        FROM Projects p
        WHERE p.projectId = ?
    `;
    db.get(sql, [req.params.id], (err, row) => err ? handleDbError(res, err, '프로젝트 상세 조회 실패') : (row ? res.json(row) : res.status(404).json({ error: "Project not found" })));
});


// 2. 기술인 API (독립적이고 안정적인 버전)
app.get('/api/technicians', (req, res) => {
    const sql = `
        SELECT 
            employeeId as id, status, name, position as role, hireDate as join_date,
            '정보 없음' as grade, '정보 없음' as skills, 0 as ongoing_projects
        FROM Employees ORDER BY hireDate DESC
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err, '기술인 조회 실패') : res.json(rows));
});

// 3. 관계사 API (독립적이고 안정적인 버전)
app.get('/api/companies', (req, res) => {
    const sql = `
        SELECT 
            companyId as id, '정상' as status, name, registrationNumber as registration_number, 
            ceoName as ceo_name, '정보 없음' as phone_number, '정보 없음' as work_manager_name,
            (SELECT COUNT(*) FROM Projects WHERE Projects.clientName = Companies.name) as transaction_count, 
            address, '정보 없음' as corporate_number 
        FROM Companies ORDER BY name
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err, '관계사 조회 실패') : res.json(rows));
});

// 4. 청구/입금 API (독립적이고 안정적인 버전)
app.get('/api/billing', (req, res) => {
    const sql = `
        SELECT
            p.projectId as id, p.projectId as project_id, p.projectNo as project_no, p.projectName as project_name,
            p.clientName as client, p.totalAmount as contract_amount, p.equityAmount as equity_amount,
            fin.total_claimed as request_amount,
            fin.total_paid as deposit_amount,
            (fin.total_claimed - fin.total_paid) as outstanding,
            fin.claim_count as request_count,
            CASE WHEN (fin.total_claimed - fin.total_paid) <= 0 THEN '입금완료' ELSE '미수' END as status,
            CASE WHEN p.equityAmount > 0 THEN CAST(fin.total_paid * 100 / p.equityAmount AS INTEGER) ELSE 0 END as progress_rate
        FROM Projects p
        INNER JOIN (
             SELECT 
                projectId, 
                COUNT(id) as claim_count, 
                SUM(amount) as total_claimed, 
                COALESCE((SELECT SUM(amount) FROM Payments WHERE projectId = Claims.projectId), 0) as total_paid
             FROM Claims
             GROUP BY projectId
        ) fin ON p.projectId = fin.projectId
        ORDER BY p.startDate DESC
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err, '청구/입금 조회 실패') : res.json(rows));
});

// 5. 기타 기존 API (재무 확장 스키마 지원)
const REVISION_COLUMNS_SQL = `cr.id, cr.project_id, cr.revision_type, cr.status_change_date, cr.reason, cr.contract_date, cr.start_date, cr.end_date, cr.total_equity_amount, cr.remarks, cr.createdAt`;
app.get('/api/projects/:id/revisions', (req, res) => {
    const sql = `SELECT ${REVISION_COLUMNS_SQL} FROM ContractRevisions cr WHERE cr.project_id = ? ORDER BY cr.status_change_date DESC, cr.createdAt DESC`;
    db.all(sql, [req.params.id], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.get('/api/projects/:id/financials', async (req, res) => {
    const projectId = req.params.id;
    try {
        const claims = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM Claims WHERE projectId = ? ORDER BY claimDate DESC", [projectId], (err, rows) => err ? reject(err) : resolve(rows));
        });
        const payments = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM Payments WHERE projectId = ? ORDER BY paymentDate DESC", [projectId], (err, rows) => err ? reject(err) : resolve(rows));
        });
        const taxInvoices = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM TaxInvoices WHERE projectId = ? ORDER BY issueDate DESC", [projectId], (err, rows) => err ? reject(err) : resolve(rows));
        });
        res.json({ claims, payments, taxInvoices });
    } catch (err) {
        handleDbError(res, err, "Failed to fetch financial data");
    }
});

app.post('/api/projects/:id/claims', (req, res) => {
    const { claimDate, amount, description } = req.body;
    const sql = `INSERT INTO Claims (projectId, claimDate, amount, description) VALUES (?, ?, ?, ?)`;
    db.run(sql, [req.params.id, claimDate, amount, description], function(err) {
        if (err) return handleDbError(res, err, "청구 등록 실패");
        res.status(201).json({ id: this.lastID, projectId: req.params.id, claimDate, amount, description });
    });
});
app.post('/api/projects/:id/payments', (req, res) => {
    const { paymentDate, amount, paymentMethod, description } = req.body;
    const sql = `INSERT INTO Payments (projectId, paymentDate, amount, paymentMethod, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.params.id, paymentDate, amount, paymentMethod, description], function(err) {
        if (err) return handleDbError(res, err, "입금 등록 실패");
        res.status(201).json({ id: this.lastID, projectId: req.params.id, paymentDate, amount, paymentMethod, description });
    });
});
app.post('/api/projects/:id/taxinvoices', (req, res) => {
    const { issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId } = req.body;
    const sql = `INSERT INTO TaxInvoices (projectId, issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [req.params.id, issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId], function(err) {
        if (err) return handleDbError(res, err, "세금계산서 등록 실패");
        res.status(201).json({ id: this.lastID, issueDate, approvalNo, totalAmount });
    });
});

app.listen(PORT, () => {
    console.log(`\n> 지휘소(백엔드 서버)가 포트 ${PORT}에서 최종 가동을 시작합니다.`);
});