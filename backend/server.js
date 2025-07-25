const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// GET /api/projects : 프로젝트 목록에 필요한 모든 필드를 올바른 테이블에서 JOIN하여 조회
app.get('/api/projects', async (req, res) => {
    try {
        const query = `
            SELECT
                p."projectId", 
                p."projectName", 
                p."projectCategory", 
                p."pmName", 
                p."projectLocation", 
                p."status",
                p."clientName",
                c."contractId", 
                c."contractDate", 
                c."startDate", 
                c."endDate", 
                c."totalEquityAmount"
            FROM projects p
            LEFT JOIN (
                SELECT *, 
                       ROW_NUMBER() OVER(PARTITION BY "projectId" ORDER BY "contractDate" DESC, "createdAt" DESC) as rn
                FROM contracts
            ) c ON p."projectId" = c."projectId" AND c.rn = 1
            ORDER BY p."status", c."contractDate" DESC, p."createdAt" DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('API Error:', err.message);
        res.status(500).json({ message: "서버 오류: 프로젝트 목록을 가져올 수 없습니다." });
    }
});

// POST /api/projects : 신규 프로젝트 및 최초 계약 생성 (트랜잭션 적용)
app.post('/api/projects', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // 트랜잭션 시작

        // 1. 프로젝트 생성
        const { projectName, projectCategory, pmName, projectLocation, summary, facilityType, status, clientName } = req.body.project;
        if (!projectName) throw new Error("계약명은 필수 항목입니다.");
        
        const projectId = `P${new Date().getFullYear()}-${String(new Date().getTime()).slice(-6)}`;
        const projectResult = await client.query(
            `INSERT INTO projects ("projectId", "projectName", "projectCategory", "pmName", "projectLocation", "summary", "facilityType", "status", "clientName")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [projectId, projectName, projectCategory, pmName, projectLocation, summary, facilityType, status || '준비중', clientName]
        );
        const newProject = projectResult.rows[0];

        // 2. 최초 계약 생성
        const { contractId, contractType, contractDate, startDate, endDate, totalAmount, supplyAmount, vatAmount, remarks } = req.body.contract;
        if (!contractId) throw new Error("계약번호는 필수 항목입니다.");

        const totalEquityAmount = (supplyAmount || 0) + (vatAmount || 0);
        const equityRatio = totalAmount > 0 ? (totalEquityAmount / totalAmount * 100).toFixed(2) : 0;
        
        await client.query(
            `INSERT INTO contracts ("contractId", "projectId", "contractType", "contractDate", "startDate", "endDate", "totalAmount", "supplyAmount", "vatAmount", "totalEquityAmount", "equityRatio", "remarks")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [contractId, projectId, contractType || '최초', contractDate, startDate, endDate, totalAmount, supplyAmount, vatAmount, totalEquityAmount, equityRatio, remarks]
        );

        await client.query('COMMIT'); // 모든 작업이 성공했으므로 트랜잭션 완료
        res.status(201).json(newProject);

    } catch (err) {
        await client.query('ROLLBACK'); // 오류 발생 시 모든 작업 되돌리기
        console.error('API Error:', err.message);
        res.status(500).json({ message: `서버 오류: ${err.message}` });
    } finally {
        client.release(); // 커넥션 반환
    }
});

app.listen(PORT, () => {
  console.log(`백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});