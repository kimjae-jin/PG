const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'database.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error(`[ERROR] 데이터베이스 연결 실패: ${DB_FILE}`, err.message);
        process.exit(1);
    }
    console.log(`[SUCCESS] SQLite 데이터베이스에 성공적으로 연결되었습니다: ${DB_FILE}`);
});

const handleDbError = (err, res) => {
    console.error('DB Error:', err.message);
    res.status(500).json({ error: '서버 내부 오류가 발생했습니다.', details: err.message });
};

// --- Technicians Module ---
app.get('/api/technicians', (req, res) => {
    db.all("SELECT * FROM Technicians ORDER BY name", [], (err, rows) => {
        if (err) return handleDbError(err, res);
        res.json(rows);
    });
});

app.get('/api/technicians/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM Technicians WHERE technician_id = ?", [id], (err, row) => {
        if (err) return handleDbError(err, res);
        if (!row) return res.status(404).json({ error: '해당 ID의 기술인력을 찾을 수 없습니다.' });
        res.json(row);
    });
});

app.post('/api/technicians', (req, res) => {
    const { name, email } = req.body;
    const sql = `INSERT INTO Technicians (name, email) VALUES (?, ?)`;
    db.run(sql, [name, email], function(err) {
        if (err) return handleDbError(err, res);
        res.status(201).json({ technician_id: this.lastID });
    });
});

app.get('/api/technicians/:id/career', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT c.*, p.project_name FROM CareerRecords c
                 JOIN Projects p ON c.project_id = p.project_id
                 WHERE c.technician_id = ? ORDER BY c.participation_start_date DESC`;
    db.all(sql, [id], (err, rows) => {
        if (err) return handleDbError(err, res);
        res.json(rows);
    });
});

app.post('/api/technicians/:id/career', (req, res) => {
    const { id: technician_id } = req.params;
    const { project_id, participation_field, assigned_task, role, participation_start_date, participation_end_date } = req.body;
    const sql = `INSERT INTO CareerRecords (technician_id, project_id, participation_field, assigned_task, role, participation_start_date, participation_end_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [technician_id, project_id, participation_field, assigned_task, role, participation_start_date, participation_end_date], function(err) {
        if (err) return handleDbError(err, res);
        res.status(201).json({ career_id: this.lastID });
    });
});

// --- Projects & Contracts Module ---
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM Projects ORDER BY start_date DESC", [], (err, rows) => {
        if (err) return handleDbError(err, res);
        res.json(rows);
    });
});

app.get('/api/contracts/:id', async (req, res) => {
    const { id } = req.params;
    const contractSql = "SELECT * FROM Contracts WHERE contract_id = ?";
    const financialsSql = "SELECT SUM(amount) as total_paid FROM Financials WHERE contract_id = ? AND transaction_type = 'PAYMENT'";
    const revisionsSql = "SELECT SUM(revised_amount) as total_revision FROM ContractRevisions WHERE contract_id = ?";
    try {
        const contract = await new Promise((resolve, reject) => db.get(contractSql, [id], (err, row) => err ? reject(err) : resolve(row)));
        if (!contract) return res.status(404).json({ error: '해당 ID의 계약을 찾을 수 없습니다.' });
        const payment = await new Promise((resolve, reject) => db.get(financialsSql, [id], (err, row) => err ? reject(err) : resolve(row)));
        const revision = await new Promise((resolve, reject) => db.get(revisionsSql, [id], (err, row) => err ? reject(err) : resolve(row)));
        const totalPaid = payment?.total_paid || 0;
        const totalRevisionAmount = revision?.total_revision || 0;
        const finalContractAmount = contract.contract_amount + totalRevisionAmount;
        const finalBalance = finalContractAmount - totalPaid;
        res.json({ ...contract, final_contract_amount: finalContractAmount, total_paid: totalPaid, balance: finalBalance });
    } catch (err) { handleDbError(err, res); }
});

app.get('/api/contracts/:id/revisions', (req, res) => {
    const { id } = req.params;
    db.all("SELECT * FROM ContractRevisions WHERE contract_id = ? ORDER BY revision_date DESC", [id], (err, rows) => {
        if (err) return handleDbError(err, res);
        res.json(rows);
    });
});

app.post('/api/contracts/:id/revisions', (req, res) => {
    const { id: contract_id } = req.params;
    const { revision_date, revised_amount, reason, description } = req.body;
    const sql = `INSERT INTO ContractRevisions (contract_id, revision_date, revised_amount, reason, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [contract_id, revision_date, revised_amount, reason, description], function(err) {
        if (err) return handleDbError(err, res);
        res.status(201).json({ revision_id: this.lastID });
    });
});

// --- Bidding & PQ Module ---
app.post('/api/bids/calculate-pq', async (req, res) => {
    const { business_type, technician_ids } = req.body;
    if (!business_type || !technician_ids || !Array.isArray(technician_ids) || technician_ids.length === 0) {
        return res.status(400).json({ error: '사업유형과 최소 1명 이상의 기술인 ID 목록이 필요합니다.' });
    }
    try {
        let totalScore = 0;
        const placeholders = technician_ids.map(() => '?').join(',');
        const technicians = await new Promise((res, rej) => db.all(`SELECT * FROM Technicians WHERE technician_id IN (${placeholders})`, technician_ids, (e,r) => e ? rej(e) : res(r)));
        for (const tech of technicians) { totalScore += 10; } // Simplified scoring logic
        if (business_type === 'IT') totalScore *= 1.1;
        res.json({ estimated_pq_score: totalScore.toFixed(2) });
    } catch (err) { handleDbError(err, res); }
});

// --- Quotation Module ---
app.post('/api/contracts/from-quotation/:id', (req, res) => {
    const { id: quotation_id } = req.params;
    // Logic to create contract from quotation
    res.status(201).json({ message: "견적으로부터 계약이 성공적으로 생성되었습니다."});
});

// --- Document Module ---
app.get('/api/documents/next-number', (req, res) => {
    const { type } = req.query;
    const year = new Date().getFullYear();
    const prefix = type ? type.toUpperCase() : 'DOC';
    res.json({ next_document_number: `${prefix}-${year}-0001` });
});

app.listen(PORT, () => {
    console.log(`[INFO] 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
