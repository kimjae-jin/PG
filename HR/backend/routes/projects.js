// [HR/backend/routes/projects.js]
import { Router } from 'express';
import db from '../db.js';
const router = Router();
router.get('/', (req, res) => {
    const sql = `SELECT projectId, projectIdentifier, projectName FROM Projects ORDER BY updatedAt DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) { res.status(500).json({ error: '데이터베이스 조회 실패' }); } 
        else { res.json(rows); }
    });
});
export default router;