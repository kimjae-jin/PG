const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json());
app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ message: "DB 조회 오류" }); }
});
app.listen(PORT, () => { console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`); });
