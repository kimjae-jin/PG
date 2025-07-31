// backend/server.js

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import initializeDatabase from '../migration/initializeDatabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');

const db = new (sqlite3.verbose().Database)(DB_PATH);

app.use(cors());
app.use(express.json());

// --- API 라우트 ---
app.get('/api/projects', (req, res) => {
  const sql = `
    SELECT p.* FROM projects p ORDER BY p.start_date DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// [최종 수정] 데이터가 없을 경우 404 오류를 명확히 반환하도록 수정
app.get('/api/projects/:id', (req, res) => {
  const sql = `
    SELECT 
      p.*, 
      COALESCE((SELECT SUM(deposit_amount) FROM billing_history WHERE project_no = p.project_no), 0) as billed_amount
    FROM projects p 
    WHERE p.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // 데이터(row)가 존재하면 데이터를 보내고, 존재하지 않으면(null 또는 undefined) 404 오류를 보냄
    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: `ID ${req.params.id}에 해당하는 프로젝트를 찾을 수 없습니다.` });
    }
  });
});

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
// --- API 라우트 끝 ---

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