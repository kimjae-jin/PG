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

const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
  if (err) console.error(`❌ DB 연결 실패: ${err.message}`);
  else console.log("✅ '진실'의 데이터베이스에 성공적으로 연결되었습니다.");
});

app.use(cors());
app.use(express.json());

const handleDbError = (res, err) => {
    console.error("🔥 DATABASE ERROR:", err);
    res.status(500).json({ error: "Database error", details: err.message });
}

// --- API 라우터 ---
app.get('/api/projects', (req, res) => {
    db.all(`SELECT * FROM Projects ORDER BY startDate DESC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.get('/api/employees', (req, res) => {
    db.all(`SELECT * FROM Employees ORDER BY name;`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

app.get('/api/billing', (req, res) => {
  const sql = `
    SELECT
        p.projectId as id,
        p.projectId as project_id,
        p.projectNo as project_no,
        p.projectName as project_name,
        p.clientName as client,
        p.totalAmount as contract_amount,
        p.equityAmount as equity_amount,
        COALESCE(i.request_amount, 0) AS request_amount,
        0 AS deposit_amount, -- 입금 상태는 Invoices 테이블에 없으므로 0으로 고정
        COALESCE(i.request_amount, 0) AS outstanding,
        0 AS progress_rate, -- 입금 상태가 없으므로 0으로 고정
        COALESCE(i.request_count, 0) AS request_count,
        CASE 
            WHEN COALESCE(i.request_count, 0) > 0 THEN '미수'
            ELSE '청구없음'
        END as status
    FROM Projects p
    LEFT JOIN (
        SELECT 
            -- 프로젝트와 인보이스를 clientName으로 연결하는 것은 부정확할 수 있으므로,
            -- 프로젝트 넘버(projectNo)를 기반으로 연결하는 것이 더 안정적일 수 있으나
            -- 현재 Invoices 테이블에는 projectId가 없으므로, 우선 clientName으로 연결합니다.
            clientName,
            SUM(totalAmount) as request_amount,
            COUNT(invoiceId) as request_count
        FROM Invoices 
        GROUP BY clientName
    ) i ON p.clientName = i.clientName
    ORDER BY p.startDate DESC;
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return handleDbError(res, err);
    res.json(rows);
  });
});

app.get('/api/companies', (req, res) => {
    db.all(`SELECT * FROM Companies ORDER BY name ASC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows));
});

// --- 서버 시작 ---
app.listen(PORT, () => {
    console.log("==========================================================");
    console.log("     프로젝트 제네시스 - 최종 활성화 v8.0      ");
    console.log("==========================================================");
    console.log(`> '진실'의 데이터베이스 위에서 모든 API가 정상적으로 동작합니다.`);
    console.log(`> 지휘소(백엔드 서버)가 포트 ${PORT}에서 최종 가동을 시작합니다.`);
});