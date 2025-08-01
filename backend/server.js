import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, updateProjectFinancesAndStatus } from '../migration/initializeDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

app.use(cors());
app.use(express.json());

app.get('/api/projects', (req, res) => {
  const sql = `
    SELECT 
      p.*,
      CASE 
        WHEN p.equity_amount > 0 THEN CAST(p.billed_amount * 100 / p.equity_amount AS INTEGER) 
        ELSE 0 
      END as equity_rate
    FROM projects p 
    ORDER BY p.start_date DESC
  `;
  db.all(sql, [], (err, rows) => { 
    if (err) return res.status(500).json({ error: err.message }); 
    res.json(rows); 
  });
});

// [핵심] 관계사 목록 API - '거래횟수' 동적 계산 추가
app.get('/api/companies', (req, res) => {
  const sql = `
    SELECT 
      c.*,
      (SELECT COUNT(p.id) FROM projects p WHERE p.client = c.name) as transaction_count
    FROM companies c 
    ORDER BY c.name ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get('/api/billing', (req, res) => {
    const sql = `
        SELECT
            b.id, p.id as project_id,
            b.project_no, p.project_name, p.client, 
            CASE
                WHEN b.request_amount IS NULL THEN '예정'
                WHEN COALESCE(b.deposit_amount, 0) >= b.request_amount THEN '입금'
                WHEN b.request_date IS NOT NULL AND (julianday('now', 'localtime') - julianday(b.request_date)) > 30 THEN '장기미수'
                ELSE '미수'
            END as status,
            p.contract_amount, p.equity_amount,
            p.progress_rate,
            b.request_amount, b.deposit_amount,
            MAX(0, COALESCE(b.request_amount, 0) - COALESCE(b.deposit_amount, 0)) as outstanding,
            ROW_NUMBER() OVER (PARTITION BY p.project_no ORDER BY b.request_date ASC, b.id ASC) as request_count,
            b.note
        FROM billing_history b
        JOIN projects p ON b.project_no = p.project_no
        ORDER BY b.request_date DESC, b.deposit_date DESC
    `;
    db.all(sql, [], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

app.get('/api/projects/:id', (req, res) => { const sql = `SELECT p.*, COALESCE((SELECT SUM(deposit_amount) FROM billing_history WHERE project_no = p.project_no), 0) as billed_amount, CASE WHEN p.equity_amount > 0 THEN CAST(COALESCE((SELECT SUM(deposit_amount) FROM billing_history WHERE project_no = p.project_no), 0) * 100 / p.equity_amount AS INTEGER) ELSE 0 END as equity_rate FROM projects p WHERE p.id = ?`; db.get(sql, [req.params.id], (err, row) => { if (err) return res.status(500).json({ error: err.message }); if (!row) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' }); res.json(row); }); });
app.get('/api/projects/:id/notes', (req, res) => { const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?"; db.get(getProjectNoSql, [req.params.id], (err, project) => { if (err) return res.status(500).json({ error: err.message }); if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' }); const getNotesSql = "SELECT * FROM special_notes_log WHERE project_no = ? ORDER BY created_at DESC"; db.all(getNotesSql, [project.project_no], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); }); });
app.post('/api/projects/:id/notes', (req, res) => { const { note } = req.body; if (!note) return res.status(400).json({ error: '내용이 필요합니다.' }); const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?"; db.get(getProjectNoSql, [req.params.id], (err, project) => { if (err) return res.status(500).json({ error: err.message }); if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' }); const insertNoteSql = "INSERT INTO special_notes_log (project_no, note) VALUES (?, ?)"; const stmt = db.prepare(insertNoteSql); stmt.run(project.project_no, note, function(err) { if (err) return res.status(500).json({ error: err.message }); db.get("SELECT * FROM special_notes_log WHERE id = ?", [this.lastID], (err, newLog) => { if (err) return res.status(500).json({ error: err.message }); res.status(201).json(newLog); }); }); stmt.finalize(); }); });
app.get('/api/projects/:id/billing', (req, res) => { const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?"; db.get(getProjectNoSql, [req.params.id], (err, project) => { if (err) return res.status(500).json({ error: err.message }); if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' }); const getBillingSql = "SELECT * FROM billing_history WHERE project_no = ? ORDER BY request_date ASC, deposit_date ASC"; db.all(getBillingSql, [project.project_no], (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); }); }); });
app.post('/api/billing', async (req, res) => { const { project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note } = req.body; if (!project_no) return res.status(400).json({ error: '프로젝트 번호는 필수입니다.' }); const sql = `INSERT INTO billing_history (project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)`; db.run(sql, [project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note], async function(err) { if (err) return res.status(500).json({ error: err.message }); try { await updateProjectFinancesAndStatus(db, project_no); db.get("SELECT * FROM billing_history WHERE id = ?", [this.lastID], (err, newBilling) => { if (err) return res.status(500).json({ error: err.message }); res.status(201).json(newBilling); }); } catch (updateErr) { res.status(500).json({ error: `데이터는 추가되었으나, 프로젝트 정보 업데이트 중 오류 발생: ${updateErr.message}` }); } }); });
async function startServer() { try { console.log("데이터베이스 연결을 시도합니다..."); console.log("데이터베이스에 성공적으로 연결되었습니다."); await initializeDatabase(db); app.listen(PORT, () => { console.log(`모든 준비 완료. 백엔드 서버가 포트 ${PORT}에서 외부 요청을 받기 시작합니다.`); }); } catch (err) { console.error("서버 시동 중 치명적인 오류 발생:", err); process.exit(1); } }
startServer();