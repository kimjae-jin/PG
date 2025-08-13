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

// [핵심 수정] 새로운 재무 테이블을 기반으로 SQL 재설계
const PROJECT_SQL = `
    SELECT
        p.projectId as id,
        p.projectNo as project_no,
        p.projectName as project_name,
        p.clientName as client,
        p.manager,
        p.contractDate as contract_date,
        p.startDate as start_date,
        p.endDate as end_date,
        p.completionDate as completion_date,
        p.totalAmount as contract_amount,
        p.equityAmount as equity_amount,
        COALESCE(fin.total_claimed, 0) as total_billed_amount,
        COALESCE(fin.total_paid, 0) as total_paid_amount,
        (COALESCE(p.equityAmount, 0) - COALESCE(fin.total_paid, 0)) as balance,
        COALESCE(fin.claim_count, 0) as request_count,
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
    FROM 
        Projects p
    LEFT JOIN (
        SELECT 
            c.projectId, 
            COUNT(c.id) as claim_count,
            SUM(c.amount) as total_claimed,
            (SELECT SUM(py.amount) FROM Payments py WHERE py.projectId = c.projectId) as total_paid
        FROM Claims c
        GROUP BY c.projectId
    ) fin ON p.projectId = fin.projectId
`;

app.get('/api/projects', (req, res) => {
    const sql = `${PROJECT_SQL} ORDER BY p.startDate DESC`;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.get('/api/projects/:id', (req, res) => {
    const sql = `${PROJECT_SQL} WHERE p.projectId = ?`;
    db.get(sql, [req.params.id], (err, row) => err ? handleDbError(res, err) : (row ? res.json(row) : res.status(404).json({ error: "Project not found" })));
});

// 기존 API들 (변경 없음)
const REVISION_COLUMNS_SQL = `cr.id, cr.project_id, cr.revision_type, cr.status_change_date, cr.reason, cr.contract_date, cr.start_date, cr.end_date, cr.total_equity_amount, cr.remarks, cr.createdAt`;
app.get('/api/projects/:id/revisions', (req, res) => { /* ... */ });
app.post('/api/projects/:id/revisions', upload.single('attachment'), (req, res) => { /* ... */ });
app.get('/api/technicians', (req, res) => { /* ... */ });
app.get('/api/companies', (req, res) => { /* ... */ });


// [폐기 및 대체] /api/billing API를 완전히 새로운 로직으로 대체
app.get('/api/billing', (req, res) => {
    console.log('✅ GET /api/billing 요청 수신 (재무 확장판)');
    const sql = `
        SELECT
            p.projectId as id,
            p.projectId as project_id,
            p.projectNo as project_no,
            p.projectName as project_name,
            p.clientName as client,
            p.totalAmount as contract_amount,
            p.equityAmount as equity_amount,
            fin.total_claimed as request_amount,
            fin.total_paid as deposit_amount,
            (fin.total_claimed - fin.total_paid) as outstanding,
            fin.claim_count as request_count,
            CASE 
                WHEN (fin.total_claimed - fin.total_paid) <= 0 THEN '입금완료'
                ELSE '미수'
            END as status,
            CASE 
                WHEN p.equityAmount > 0 THEN CAST(fin.total_paid * 100 / p.equityAmount AS INTEGER)
                ELSE 0
            END as progress_rate
        FROM 
            Projects p
        INNER JOIN (
             SELECT 
                c.projectId, 
                COUNT(c.id) as claim_count, 
                SUM(c.amount) as total_claimed, 
                COALESCE((SELECT SUM(py.amount) FROM Payments py WHERE py.projectId = c.projectId), 0) as total_paid
             FROM Claims c
             GROUP BY c.projectId
        ) fin ON p.projectId = fin.projectId
        ORDER BY p.startDate DESC
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

// [신규 API] 특정 프로젝트의 모든 재무 활동을 가져오는 API
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

// [신규 API] 재무 데이터 생성을 위한 POST API들
app.post('/api/projects/:id/claims', (req, res) => {
    const { claimDate, amount, description } = req.body;
    const sql = `INSERT INTO Claims (projectId, claimDate, amount, description) VALUES (?, ?, ?, ?)`;
    db.run(sql, [req.params.id, claimDate, amount, description], function(err) {
        if (err) return handleDbError(res, err);
        res.status(201).json({ id: this.lastID, projectId: req.params.id, claimDate, amount, description });
    });
});

app.post('/api/projects/:id/payments', (req, res) => {
    const { paymentDate, amount, paymentMethod, description } = req.body;
    const sql = `INSERT INTO Payments (projectId, paymentDate, amount, paymentMethod, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.params.id, paymentDate, amount, paymentMethod, description], function(err) {
        if (err) return handleDbError(res, err);
        res.status(201).json({ id: this.lastID, projectId: req.params.id, paymentDate, amount, paymentMethod, description });
    });
});

app.post('/api/projects/:id/taxinvoices', (req, res) => {
    const { issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId } = req.body;
    const sql = `INSERT INTO TaxInvoices (projectId, issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [req.params.id, issueDate, approvalNo, totalAmount, taxAmount, description, linkedClaimId], function(err) {
        if (err) return handleDbError(res, err);
        res.status(201).json({ id: this.lastID, /* ... all fields ... */ });
    });
});

app.listen(PORT, () => {
    console.log(`\n> 지휘소(백엔드 서버)가 포트 ${PORT}에서 최종 가동을 시작합니다.`);
});