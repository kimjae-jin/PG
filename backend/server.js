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
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB 연결 실패:", err.message);
    return;
  }
  console.log("SQLite DB에 성공적으로 연결되었습니다.");

  db.serialize(() => {
    // 프로젝트 테이블 생성
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
      special_notes_log TEXT,
      status TEXT
    )`, (err) => {
      if (err) return console.error("projects 테이블 생성 오류:", err.message);
      
      // 샘플 프로젝트 데이터 추가
      db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
        if (row.count === 0) {
          db.run(`INSERT INTO projects (id, project_number, category, project_name, total_amount, contract_date, start_date, end_date, pm_name, billed_amount, client_name, equity_amount, contract_type, special_notes_log, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [1, '2024-003', '안전진단', '서울시청 본관 구조안전진단 및 보수보강 설계', 1200000000, '2024.01.15', '2024.01.20', '2024.12.31', '홍길동 (부장)', 252000000, '서울시청', 1200000000, '일반', '[]', '진행중']);
          db.run(`INSERT INTO projects (id, project_number, category, project_name, total_amount, contract_date, start_date, end_date, pm_name, billed_amount, client_name, equity_amount, contract_type, special_notes_log, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [3, '2023-015-C1', '공공', '국방부 데이터센터 보안강화 변경계약', 500000000, '2024-04-10', '2024-04-10', '2024.08.31.', '김스디 (이사)', 0, '미지정', 500000000, '미지정', '[]', '진행중']);
        }
      });
    });

    // 참여 기술인 테이블 생성
    db.run(`CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      name TEXT,
      birth_date TEXT,
      position TEXT,
      task_field TEXT,
      specialty_field TEXT,
      responsibility_level TEXT,
      assigned_task TEXT,
      start_date TEXT,
      end_date TEXT,
      notes TEXT,
      FOREIGN KEY(project_id) REFERENCES projects(id)
    )`, (err) => {
       if (err) return console.error("technicians 테이블 생성 오류:", err.message);
    });
  });
});

app.get('/api/projects', (req, res) => {
  db.all("SELECT *, (CASE WHEN completion_date IS NOT NULL AND completion_date != '' THEN '완료' ELSE '진행중' END) as status FROM projects", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.get('/api/projects/:id', (req, res) => {
  db.get("SELECT *, (CASE WHEN completion_date IS NOT NULL AND completion_date != '' THEN '완료' ELSE '진행중' END) as status FROM projects WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      row.special_notes_log = JSON.parse(row.special_notes_log || '[]');
    }
    res.json(row || {});
  });
});

// [신규] 특정 프로젝트의 참여 기술인 목록 API
app.get('/api/projects/:id/technicians', (req, res) => {
  db.all("SELECT * FROM technicians WHERE project_id = ?", [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

app.listen(3000, () => console.log('백엔드 서버(v5.8 복원)가 http://localhost:3000 에서 실행 중입니다.'));