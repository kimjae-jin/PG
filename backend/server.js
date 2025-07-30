import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const dbPath = join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, () => {
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    project_number TEXT,
    category TEXT,
    project_name TEXT,
    total_amount REAL,
    contract_date TEXT,
    start_date TEXT,
    end_date TEXT,
    completion_date TEXT,
    pm_name TEXT,
    billed_amount REAL,
    remarks TEXT,
    client_name TEXT,
    equity_amount REAL,
    contract_type TEXT,
    special_notes_log TEXT
  )`, () => {
    db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
        if (row.count === 0) {
            db.run(`INSERT INTO projects (id, project_number, category, project_name, total_amount, contract_date, start_date, end_date, pm_name, billed_amount, client_name, equity_amount, contract_type, special_notes_log) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [1, '2024-003', '안전진단', '서울시청 본관 구조안전진단 및 보수보강 설계', 1200000000, '2024.01.15', '2024.01.20', '2024.12.31', '홍길동 (부장)', 252000000, '서울시청', 1200000000, '일반', '[]']);
        }
    });
  });
});

app.get('/api/projects', (req, res) => {
  db.all("SELECT * FROM projects", [], (err, rows) => res.json(rows || []));
});
app.get('/api/projects/:id', (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, row) => {
      if(row) row.special_notes_log = JSON.parse(row.special_notes_log || '[]');
      res.json(row || {});
  });
});
app.post('/api/projects/:id/notes', (req, res) => { /* 이전과 동일 */ });

app.listen(3000, () => console.log('백엔드 서버(v5.4)가 http://localhost:3000 에서 실행 중입니다.'));