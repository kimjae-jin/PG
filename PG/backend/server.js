import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import exceljs from 'exceljs';
import multer from 'multer';

// (기본 설정 및 헬퍼 함수)
const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename); const app = express(); const PORT = 5001; const DB_PATH = path.join(__dirname, 'database.db'); const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => { if (err) console.error('🔥 DB 연결 실패:', err.message); else console.log('> DB 연결 성공.'); }); const upload = multer({ dest: 'uploads/' });
app.use(cors()); app.use(express.json());
const handleDbError = (res, err, message = "DB 오류") => { console.error(`🔥 ${message.toUpperCase()}:`, err); res.status(500).json({ error: message, details: err.message }); }
const dbAll = (sql, params = []) => new Promise((resolve, reject) => db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows)));

// [핵심] '대규모 일괄 처리'를 위한 공통 함수
const getProcessedProjects = async () => {
    // 1. 필요한 모든 데이터를 '일괄'로 가져온다 (쿼리 횟수 최소화)
    const [projects, allClients, allContracts, allFinancials, allRevisions] = await Promise.all([
        dbAll(`SELECT * FROM Projects`),
        dbAll(`SELECT pc.projectId, c.clientName FROM Clients c JOIN ProjectClients pc ON c.clientId = pc.clientId`),
        dbAll(`SELECT * FROM Contracts`), // 모든 계약 정보
        dbAll(`SELECT c.projectId, SUM(i.invoiceAmount) as totalInvoiced, SUM(i.paymentAmount) as totalPaid, COUNT(i.invoiceId) as invoiceCount FROM Invoices i JOIN Contracts c ON i.contractId = c.contractId GROUP BY c.projectId`),
        dbAll(`SELECT c.projectId, COUNT(cr.revisionId) as revisionCount, MAX(CASE WHEN cr.changeReason LIKE '%중지%' THEN cr.revisionDate END) as stopDate, MAX(CASE WHEN cr.changeReason LIKE '%재개%' THEN cr.revisionDate END) as restartDate FROM ContractRevisions cr JOIN Contracts c ON cr.contractId = c.contractId GROUP BY c.projectId`)
    ]);

    // 2. JavaScript 메모리 위에서 데이터를 빠르고 효율적으로 조립한다.
    const clientsMap = new Map();
    allClients.forEach(c => {
        if (!clientsMap.has(c.projectId)) clientsMap.set(c.projectId, []);
        clientsMap.get(c.projectId).push(c.clientName);
    });

    const contractsMap = new Map();
    allContracts.forEach(c => contractsMap.set(c.projectId, c)); // 프로젝트당 최신 계약 1개로 가정

    const financialsMap = new Map();
    allFinancials.forEach(f => financialsMap.set(f.projectId, f));
    
    const revisionsMap = new Map();
    allRevisions.forEach(r => revisionsMap.set(r.projectId, r));

    return projects.map(p => {
        const contract = contractsMap.get(p.projectId) || {};
        const financials = financialsMap.get(p.projectId) || { totalInvoiced: 0, totalPaid: 0, invoiceCount: 0 };
        const revisions = revisionsMap.get(p.projectId) || { revisionCount: 0, stopDate: null, restartDate: null };
        const clientNames = (clientsMap.get(p.projectId) || []).join(', ');
        
        const balance = (contract.totalEquityAmount || 0) - (financials.totalPaid || 0);
        const progressRate = (contract.totalEquityAmount || 0) === 0 ? 0 : (((financials.totalInvoiced || 0) * 100.0) / contract.totalEquityAmount);
        let status = p.status;
        if (balance <= 0 && financials.totalInvoiced > 0) status = '완료';

        return { ...p, ...contract, clientNames, invoiceCount: financials.invoiceCount, isRevised: (revisions.revisionCount || 0) > 0 ? 'O' : '', stopDate: revisions.stopDate, restartDate: revisions.restartDate, balance, progressRate, status };
    });
};

// --- API 엔드포인트 ---
app.get('/api/projects', async (req, res) => {
    try {
        const processedProjects = await getProcessedProjects();
        res.json(processedProjects);
    } catch (err) {
        handleDbError(res, err, '프로젝트 목록 조회 실패');
    }
});
// (내보내기, 불러오기 API는 이전과 동일한 로직을 사용하므로 생략)

app.listen(PORT, () => {
    console.log(`\n> 최종 API 서버 v9.6(대규모 처리 최적화)가 포트 ${PORT}에서 작전을 개시합니다.`);
});