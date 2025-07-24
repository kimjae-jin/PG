const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// GET: 모든 프로젝트 조회
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY status, contractDate DESC, createdAt DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "데이터베이스 조회 중 오류가 발생했습니다." });
    }
});

// POST: 신규 프로젝트 생성
app.post('/api/projects', async (req, res) => {
    try {
        const { projectName, status, clientName } = req.body; // 필수/핵심 데이터 우선
        if (!projectName) {
            return res.status(400).json({ message: "계약명은 필수 항목입니다." });
        }
        const projectId = `P${new Date().getFullYear()}-${String(new Date().getTime()).slice(-6)}`;
        const result = await pool.query(
            'INSERT INTO projects (projectId, projectName, status, clientName) VALUES ($1, $2, $3, $4) RETURNING *',
            [projectId, projectName, status || '계약', clientName || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "프로젝트 생성 중 오류가 발생했습니다." });
    }
});

// (향후 확장을 위한 PUT, DELETE 주석 처리)
/*
// PUT: 프로젝트 수정
app.put('/api/projects/:id', async (req, res) => { ... });

// DELETE: 프로젝트 삭제
app.delete('/api/projects/:id', async (req, res) => { ... });
*/

app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
