import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');

const db = new (sqlite3.verbose().Database)(DB_PATH);
app.use(cors());
app.use(express.json());

const handleDbError = (res, err) => {
    console.error("🔥 DATABASE ERROR:", err);
    res.status(500).json({ error: "Database error", details: err.message });
}

const PROJECT_COLUMNS_SQL = `
    p.projectId as id, p.projectNo as project_no, p.projectName as project_name, p.clientName as client,
    p.totalAmount as contract_amount, p.equityAmount as equity_amount,
    (CASE WHEN p.totalAmount > 0 THEN (p.equityAmount * 100 / p.totalAmount) ELSE 0 END) as equity_rate,
    p.contractDate as contract_date, p.startDate as start_date, p.endDate as end_date,
    p.completionDate as completion_date, p.manager, p.special_notes,
    (CASE WHEN p.completionDate IS NOT NULL AND p.completionDate != '' THEN '완료' ELSE '진행중' END) as status,
    COALESCE(inv.total_billed, 0) as total_billed_amount,
    (p.totalAmount - COALESCE(inv.total_billed, 0)) as balance,
    COALESCE(inv.invoice_count, 0) as request_count,
    (CASE WHEN p.totalAmount > 0 THEN (COALESCE(inv.total_billed, 0) * 100 / p.totalAmount) ELSE 0 END) as progress_rate
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
    db.get(sql, [req.params.id], (err, row) => err ? handleDbError(res, err) : res.json(row));
});

// 다른 API들도 여기에 추가
app.listen(PORT, () => {
    console.log(`\n> 지휘소(백엔드 서버)가 포트 ${PORT}에서 최종 가동을 시작합니다.`);
});
