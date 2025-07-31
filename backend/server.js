// backend/server.js

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, updateProjectFinances } from '../migration/initializeDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');

const db = new (sqlite3.verbose().Database)(DB_PATH);

app.use(cors());
app.use(express.json());

// --- [최종 수정] 모든 API 라우트를 완벽하게 복원 및 통합 ---

// 1. 프로젝트 목록 조회 API
app.get('/api/projects', (req, res) => {
  const sql = `SELECT p.* FROM projects p ORDER BY p.start_date DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. 프로젝트 상세 정보 조회 API
app.get('/api/projects/:id', (req, res) => {
  const sql = `
    SELECT 
      p.*, 
      COALESCE((SELECT SUM(deposit_amount) FROM billing_history WHERE project_no = p.project_no), 0) as billed_amount
    FROM projects p 
    WHERE p.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
    res.json(row);
  });
});

// 3. 특정 프로젝트의 특이사항 조회 API
app.get('/api/projects/:id/notes', (req, res) => {
    const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?";
    db.get(getProjectNoSql, [req.params.id], (err, project) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
        const getNotesSql = "SELECT * FROM special_notes_log WHERE project_no = ? ORDER BY created_at DESC";
        db.all(getNotesSql, [project.project_no], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

// 4. 특정 프로젝트에 특이사항 추가 API
app.post('/api/projects/:id/notes', (req, res) => {
    const { note } = req.body;
    if (!note) return res.status(400).json({ error: '내용이 필요합니다.' });
    const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?";
    db.get(getProjectNoSql, [req.params.id], (err, project) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
        const insertNoteSql = "INSERT INTO special_notes_log (project_no, note) VALUES (?, ?)";
        const stmt = db.prepare(insertNoteSql);
        stmt.run(project.project_no, note, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.get("SELECT * FROM special_notes_log WHERE id = ?", [this.lastID], (err, newLog) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json(newLog);
            });
        });
        stmt.finalize();
    });
});

// 5. 특정 프로젝트의 청구/재무 내역 조회 API
app.get('/api/projects/:id/billing', (req, res) => {
    const getProjectNoSql = "SELECT project_no FROM projects WHERE id = ?";
    db.get(getProjectNoSql, [req.params.id], (err, project) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
        const getBillingSql = "SELECT * FROM billing_history WHERE project_no = ? ORDER BY request_date ASC, deposit_date ASC";
        db.all(getBillingSql, [project.project_no], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
    });
});

// 6. 통합 '청구/입금' 목록 조회 API (신규 추가된 부분)
app.get('/api/billing', (req, res) => {
    const sql = `
        SELECT
            b.id, b.project_no, p.project_name, p.client, b.request_type,
            b.request_date, b.request_amount, b.deposit_date, b.deposit_amount,
            (COALESCE(b.request_amount, 0) - COALESCE(b.deposit_amount, 0)) as outstanding,
            b.note
        FROM billing_history b
        JOIN projects p ON b.project_no = p.project_no
        ORDER BY b.request_date DESC, b.deposit_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 7. 신규 '청구/입금' 내역 추가 API (신규 추가된 부분)
app.post('/api/billing', async (req, res) => {
    const { project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note } = req.body;
    if (!project_no) return res.status(400).json({ error: '프로젝트 번호는 필수입니다.' });
    const sql = `INSERT INTO billing_history (project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note], async function(err) {
        if (err) return res.status(500).json({ error: err.message });
        try {
            await updateProjectFinances(db, project_no);
            db.get("SELECT * FROM billing_history WHERE id = ?", [this.lastID], (err, newBilling) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json(newBilling);
            });
        } catch (updateErr) {
            res.status(500).json({ error: `데이터는 추가되었으나, 프로젝트 정보 업데이트 중 오류 발생: ${updateErr.message}` });
        }
    });
});

// --- 서버 시동 로직 ---
async function startServer() {
    try {
        console.log("데이터베이스 연결을 시도합니다...");
        console.log("데이터베이스에 성공적으로 연결되었습니다.");
        await initializeDatabase(db);
        app.listen(PORT, () => {
            console.log(`모든 준비 완료. 백엔드 서버가 포트 ${PORT}에서 외부 요청을 받기 시작합니다.`);
        });
    } catch (err) {
        console.error("서버 시동 중 치명적인 오류 발생:", err);
        process.exit(1);
    }
}

startServer();