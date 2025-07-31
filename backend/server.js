import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { projectsData } from '../migration/project-data.js';
import { billingData } from '../migration/billing-data.js';

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
        // 1. 테이블들 초기화
        console.log("1단계: DB 테이블 초기화 중...");
        db.run('DROP TABLE IF EXISTS billing_history');
        db.run('DROP TABLE IF EXISTS projects');
        db.run('DROP TABLE IF EXISTS technicians');

        // 2. 테이블 재생성
        db.run(`CREATE TABLE projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT, project_number TEXT UNIQUE, category TEXT, project_name TEXT, client_name TEXT,
            total_amount REAL, equity_amount REAL, contract_date TEXT, start_date TEXT, end_date TEXT, completion_date TEXT,
            remarks TEXT, status TEXT, pm_name TEXT, billed_amount REAL DEFAULT 0, contract_type TEXT, special_notes_log TEXT
        )`);
        
        db.run(`CREATE TABLE billing_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, type TEXT, request_date TEXT, request_amount REAL,
            deposit_date TEXT, deposit_amount REAL, remarks TEXT, FOREIGN KEY(project_id) REFERENCES projects(id)
        )`);

        db.run(`CREATE TABLE technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER, name TEXT, birth_date TEXT, position TEXT, task_field TEXT,
            specialty_field TEXT, responsibility_level TEXT, assigned_task TEXT, start_date TEXT, end_date TEXT, notes TEXT,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        )`);

        // 3. 프로젝트 데이터 이식
        console.log("2단계: 'projects' 테이블에 실제 데이터 이식 중...");
        const projectStmt = db.prepare(`INSERT INTO projects (project_number, category, project_name, client_name, total_amount, equity_amount, contract_date, start_date, end_date, completion_date, remarks, status, pm_name, contract_type, special_notes_log) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        projectsData.forEach(p => {
            const notes = [];
            if (p.contract_date) notes.push({ id: Date.now() + Math.random(), date: p.contract_date, content: '계약 체결', type: 'auto', author: '시스템' });
            if (p.start_date) notes.push({ id: Date.now() + Math.random(), date: p.start_date, content: '프로젝트 착수', type: 'auto', author: '시스템' });
            if (p.completion_date) notes.push({ id: Date.now() + Math.random(), date: p.completion_date, content: '프로젝트 완료', type: 'auto', author: '시스템' });
            
            projectStmt.run(p.project_number, p.category, p.project_name, p.client_name, p.total_amount, p.equity_amount, p.contract_date, p.start_date, p.end_date, p.completion_date, p.remarks, p.completion_date ? '완료' : '진행중', '미지정', '일반', JSON.stringify(notes));
        });
        projectStmt.finalize(() => {
            console.log(`'projects' 테이블에 ${projectsData.length}개 데이터 이식 완료.`);
            
            // 4. 청구/재무 데이터 이식
            console.log("3단계: 'billing_history' 테이블에 실제 데이터 이식 중...");
            const billingStmt = db.prepare(`INSERT INTO billing_history (project_id, type, request_date, request_amount, deposit_date, deposit_amount, remarks) SELECT p.id, ?, ?, ?, ?, ?, ? FROM projects p WHERE p.project_number = ?`);
            billingData.forEach(b => {
                billingStmt.run(b.type, b.request_date, b.request_amount, b.deposit_date, b.deposit_amount, b.remarks, b.project_number);
            });
            billingStmt.finalize(() => {
                console.log(`'billing_history' 테이블에 ${billingData.length}개 데이터 이식 완료.`);
                
                // 5. 총 입금액 자동 계산 및 업데이트
                console.log("4단계: 프로젝트별 총 입금액(billed_amount) 자동 계산 및 업데이트 중...");
                db.run(`UPDATE projects SET billed_amount = (SELECT SUM(deposit_amount) FROM billing_history WHERE project_id = projects.id) WHERE id IN (SELECT project_id FROM billing_history)`, function(err){
                    if(err) return console.error("Billed amount 업데이트 실패:", err.message);
                    console.log(`모든 프로젝트의 총 입금액 업데이트 완료. 영향을 받은 행: ${this.changes}`);
                });
            });
        });
    }); // <<-- [핵심 수정] 누락되었던 괄호와 세미콜론을 여기에 추가했습니다.
});


// --- API Endpoints ---
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects ORDER BY project_number DESC", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    });
});

app.get('/api/projects/:id', (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) {
          row.special_notes_log = JSON.parse(row.special_notes_log || '[]');
      }
      res.json(row || {});
  });
});

app.post('/api/projects/:id/notes', (req, res) => {
  const projectId = req.params.id;
  const { content } = req.body;
  if (!content) { return res.status(400).json({ error: '내용을 입력해주세요.' }); }
  db.get("SELECT special_notes_log FROM projects WHERE id = ?", [projectId], (err, row) => {
    if (err || !row) return res.status(500).json({ error: 'DB 조회 오류 또는 프로젝트 없음' });
    const notes = JSON.parse(row.special_notes_log || '[]');
    const newNote = { id: Date.now(), date: new Date().toLocaleDateString('ko-KR').slice(0, -1).replace(/\s/g, ''), content: content, type: 'manual', author: '여니서방' };
    notes.push(newNote);
    notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    db.run("UPDATE projects SET special_notes_log = ? WHERE id = ?", [JSON.stringify(notes), projectId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json(newNote);
    });
  });
});

app.get('/api/projects/:id/technicians', (req, res) => {
    db.all("SELECT * FROM technicians WHERE project_id = ?", [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    });
});

app.get('/api/projects/:id/billings', (req, res) => {
    db.all("SELECT * FROM billing_history WHERE project_id = ? ORDER BY request_date DESC, deposit_date DESC", [req.params.id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows || []);
    });
});

app.listen(3000, () => console.log('백엔드 서버(오류 수정 및 재무 데이터 완전 통합)가 http://localhost:3000 에서 실행 중입니다.'));