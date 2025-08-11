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
        const projectId = req.params.id || req.body.projectId;
        if (!projectId) {
            return cb(new Error("Project ID is missing"), false);
        }
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

const handleDbError = (res, err) => {
    console.error("🔥 DATABASE ERROR:", err);
    res.status(500).json({ error: "Database error", details: err.message });
}

const PROJECT_COLUMNS_SQL = `
    p.projectId as id, p.projectNo as project_no, p.projectName as project_name, p.clientName as client,
    p.totalAmount, p.equityAmount as equity_amount, p.equityAmount as contract_amount,
    p.contractDate as contract_date, p.startDate as start_date, p.endDate as end_date, p.completionDate as completion_date,
    p.manager, p.special_notes,
    CASE
        WHEN p.current_status IN ('중지', '취소', '삭제', '보류') THEN p.current_status
        WHEN p.endDate IS NOT NULL AND p.endDate != '' AND p.endDate < date('now', 'localtime') THEN '완료'
        ELSE '진행중'
    END as status,
    p.status_change_date,
    COALESCE(inv.total_billed, 0) as billed_amount,
    (p.equityAmount - COALESCE(inv.total_billed, 0)) as balance,
    COALESCE(inv.invoice_count, 0) as request_count
`;

app.get('/api/projects', (req, res) => {
    const sql = `
        SELECT ${PROJECT_COLUMNS_SQL}
        FROM Projects p
        LEFT JOIN (
            SELECT clientName, COUNT(invoiceId) as invoice_count, SUM(totalAmount) as total_billed
            FROM Invoices GROUP BY clientName
        ) inv ON p.clientName = inv.clientName
        ORDER BY p.startDate DESC
    `;
    db.all(sql, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.get('/api/projects/:id', (req, res) => {
    const sql = `
        SELECT ${PROJECT_COLUMNS_SQL}
        FROM Projects p
        LEFT JOIN (
            SELECT clientName, COUNT(invoiceId) as invoice_count, SUM(totalAmount) as total_billed
            FROM Invoices GROUP BY clientName
        ) inv ON p.clientName = inv.clientName
        WHERE p.projectId = ?
    `;
    db.get(sql, [req.params.id], (err, row) => err ? handleDbError(res, err) : (row ? res.json(row) : res.status(404).json({ error: "Project not found" })));
});

app.get('/api/projects/:id/revisions', (req, res) => {
    const sql = `
        SELECT
            cr.id, cr.project_id, cr.revision_type, cr.status_change_date, cr.reason, 
            cr.contract_date, cr.start_date, cr.end_date, cr.total_equity_amount, cr.remarks, cr.createdAt,
            COUNT(a.id) as attachment_count
        FROM ContractRevisions cr
        LEFT JOIN Attachments a ON cr.id = a.revision_id
        WHERE cr.project_id = ?
        GROUP BY cr.id
        ORDER BY cr.status_change_date DESC, cr.createdAt DESC
    `;
    db.all(sql, [req.params.id], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.post('/api/projects/:id/revisions', upload.single('attachment'), (req, res) => {
    const projectId = req.params.id;
    const revisionData = req.body;
    const file = req.file;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        const insertRevisionSql = `
            INSERT INTO ContractRevisions (project_id, revision_type, status_change_date, reason, contract_date, start_date, end_date, total_equity_amount, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`;
        const revisionParams = [projectId, revisionData.revision_type, revisionData.status_change_date, revisionData.reason, revisionData.contract_date, revisionData.start_date, revisionData.end_date, revisionData.total_equity_amount];
        
        db.run(insertRevisionSql, revisionParams, function(err) {
            if (err) { db.run('ROLLBACK'); return handleDbError(res, err); }
            const revisionId = this.lastID;

            const finalizeTransaction = () => {
                const newStatus = revisionData.revision_type === '재개' ? '진행중' : revisionData.revision_type;
                const updateProjectSql = `UPDATE Projects SET current_status = ?, status_change_date = ? WHERE projectId = ?`;
                const updateParams = [newStatus, revisionData.status_change_date, projectId];
                
                db.run(updateProjectSql, updateParams, function(err) {
                    if (err) { db.run('ROLLBACK'); return handleDbError(res, err); }
                    db.run('COMMIT');
                    res.status(201).json({ message: '이력이 성공적으로 추가되었습니다.', revisionId: revisionId });
                });
            };

            if (file) {
                const insertAttachmentSql = `INSERT INTO Attachments (project_id, revision_id, file_path, original_filename, mime_type) VALUES (?, ?, ?, ?, ?)`;
                const attachmentParams = [projectId, revisionId, file.path, file.originalname, file.mimetype];
                db.run(insertAttachmentSql, attachmentParams, (err) => {
                    if (err) { db.run('ROLLBACK'); return handleDbError(res, err); }
                    finalizeTransaction();
                });
            } else {
                finalizeTransaction();
            }
        });
    });
});

app.post('/api/revisions/:revisionId/attachments', (req, res) => {
    db.get('SELECT project_id FROM ContractRevisions WHERE id = ?', [req.params.revisionId], (err, revision) => {
        if (err) return handleDbError(res, err);
        if (!revision) return res.status(404).json({ error: 'Revision not found' });
        
        req.body.projectId = revision.project_id;
        
        const singleUpload = upload.single('attachment');
        singleUpload(req, res, function(err) {
            if (err) {
                console.error("🔥 UPLOAD ERROR:", err);
                return res.status(500).json({ error: "File upload error", details: err.message });
            }
            const file = req.file;
            if (!file) return res.status(400).json({ error: 'No file uploaded' });

            const insertAttachmentSql = `INSERT INTO Attachments (project_id, revision_id, file_path, original_filename, mime_type) VALUES (?, ?, ?, ?, ?)`;
            const params = [revision.project_id, req.params.revisionId, file.path, file.originalname, file.mimetype];

            db.run(insertAttachmentSql, params, function(err) {
                if (err) return handleDbError(res, err);
                res.status(201).json({ message: '파일이 성공적으로 첨부되었습니다.' });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`\n> 지휘소(백엔드 서버)가 포트 ${PORT}에서 최종 가동을 시작합니다.`);
});