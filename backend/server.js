import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import multer from 'multer';
import puppeteer from 'puppeteer';

// --- 기본 설정 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'database.db');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const GENERATED_DIR = path.join(UPLOADS_DIR, 'generated');
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// --- 폴더 생성 ---
[UPLOADS_DIR, GENERATED_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// --- DB 연결 ---
const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
  if (err) console.error(err.message);
  else console.log('Connected to the SQLite database.');
});

// --- Multer 설정 (파일 업로드용) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  }
});
const upload = multer({ storage: storage });

// --- 미들웨어 설정 ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/templates', express.static(TEMPLATES_DIR));

// --- PDF 생성 엔진 ---
async function generatePdf(templateName, data) {
    const templatePath = path.join(TEMPLATES_DIR, 'html', `${templateName}.html`);
    const outputPath = path.join(GENERATED_DIR, `${Date.now()}_${templateName}.pdf`);
  
    if (!fs.existsSync(templatePath)) {
        throw new Error(`템플릿 파일을 찾을 수 없습니다: ${templatePath}`);
    }

    let htmlContent = fs.readFileSync(templatePath, 'utf-8');
  
    for (const key in data) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        if (key.endsWith('Url') && data[key]) {
            const imagePath = path.join(__dirname, data[key]);
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
                htmlContent = htmlContent.replace(placeholder, base64Image);
            } else {
                htmlContent = htmlContent.replace(placeholder, '');
            }
        } else {
            htmlContent = htmlContent.replace(placeholder, data[key] || '');
        }
    }

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' }
    });
    await browser.close();
    return outputPath;
}

// --- API 헬퍼 함수 (에러 핸들링용) ---
const handleDbError = (res, err) => res.status(500).json({ error: "Database error", details: err.message });

// --- API 라우터 ---

// 문서 자동화 라우터
const documentsRouter = express.Router();
documentsRouter.post('/generate-pdf', async (req, res) => {
  const { projectId, templateName } = req.body;
  
  if (!projectId || !templateName) {
    return res.status(400).json({ error: 'projectId와 templateName은 필수입니다.' });
  }

  try {
    const project = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM projects WHERE id = ?`, [projectId], (err, row) => err ? reject(err) : resolve(row));
    });
    const settings = await new Promise((resolve, reject) => {
      db.get(`SELECT * FROM SystemSettings WHERE id = 1`, [], (err, row) => err ? reject(err) : resolve(row));
    });

    if (!project) {
      return res.status(404).json({ error: `프로젝트(ID: ${projectId})를 찾을 수 없습니다.` });
    }
    if (!settings || !settings.companyName) {
        return res.status(404).json({ error: `시스템 설정(SystemSettings)에 회사 정보가 없습니다. 회사 정보를 먼저 입력해야 합니다.` });
    }

    const now = new Date();
    const dataForPdf = {
      projectName: project.project_name,
      myCompanyName: settings.companyName,
      myCompanyCeoName: settings.companyCeoName,
      myCompanyAddress: settings.companyAddress,
      myCompanySealUrl: settings.companySealUrl,
      myCompanyUsageSealUrl: settings.companyUsageSealUrl,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate()
    };
    
    const generatedFilePath = await generatePdf(templateName, dataForPdf);
    console.log(`✅ PDF 생성 완료: ${generatedFilePath}`);
    res.download(generatedFilePath, path.basename(generatedFilePath), (err) => {
      if (err) console.error('파일 다운로드 응답 오류:', err);
      // fs.unlinkSync(generatedFilePath);
    });

  } catch (err) {
    console.error(`[심각한 오류] 문서 생성 실패:`, err);
    res.status(500).json({ 
        error: '문서 생성 중 심각한 서버 오류가 발생했습니다.',
        details: err.message 
    });
  }
});
app.use('/api/documents', documentsRouter);

// 프로젝트 API
app.get('/api/projects', (req, res) => {
  const sql = `SELECT * FROM projects ORDER BY start_date DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ "error": err.message });
    res.json(rows);
  });
});
app.get('/api/projects/:id', (req, res) => {
  const sql = `SELECT * FROM projects WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ "error": err.message });
    if (!row) return res.status(404).json({ "error": '프로젝트를 찾을 수 없습니다.' });
    res.json(row);
  });
});
const upsertProject = (req, res) => {
    const { project_no, project_name, client, manager, status, contract_date, start_date, end_date, completion_date, contract_amount, equity_amount, remarks, special_notes } = req.body;
    const isNew = !req.params.id;
    const sql = isNew ?
        `INSERT INTO projects (project_no, project_name, client, manager, status, contract_date, start_date, end_date, completion_date, contract_amount, equity_amount, remarks, special_notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)` :
        `UPDATE projects SET project_no = ?, project_name = ?, client = ?, manager = ?, status = ?, contract_date = ?, start_date = ?, end_date = ?, completion_date = ?, contract_amount = ?, equity_amount = ?, remarks = ?, special_notes = ? WHERE id = ?`;
    const params = isNew ?
        [project_no, project_name, client, manager, status, contract_date, start_date, end_date, completion_date, contract_amount, equity_amount, remarks, special_notes] :
        [project_no, project_name, client, manager, status, contract_date, start_date, end_date, completion_date, contract_amount, equity_amount, remarks, special_notes, req.params.id];
    db.run(sql, params, function(err) {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "id": isNew ? this.lastID : req.params.id });
    });
};
app.post('/api/projects', upsertProject);
app.put('/api/projects/:id', upsertProject);

// 관계사 API
app.get('/api/companies', (req, res) => {
  const sql = `SELECT c.*, (SELECT COUNT(p.id) FROM projects p WHERE p.client = c.name) as transaction_count FROM companies c ORDER BY c.name ASC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ "error": err.message });
    res.json(rows);
  });
});

// 기술인 (Employees) API
const employeesRouter = express.Router();
employeesRouter.get('/', (req, res) => db.all(`SELECT * FROM Employees ORDER BY name`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/employees', employeesRouter);

// 청구/입금 (Invoices) API
const invoicesRouter = express.Router();
invoicesRouter.get('/', (req, res) => db.all(`SELECT * FROM Invoices ORDER BY issueDate DESC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/invoices', invoicesRouter);

// 사업수행능력평가 (PqEvaluations) API
const pqRouter = express.Router();
pqRouter.get('/', (req, res) => db.all(`SELECT * FROM PqEvaluations ORDER BY submissionDate DESC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/pq-evaluations', pqRouter);

// 입찰분석 (BidAnalyses) API
const bidRouter = express.Router();
bidRouter.get('/', (req, res) => db.all(`SELECT * FROM BidAnalyses ORDER BY bidDate DESC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/bid-analyses', bidRouter);

// 업/면허 (Licenses) API
const licensesRouter = express.Router();
licensesRouter.get('/', (req, res) => db.all(`SELECT * FROM Licenses ORDER BY category, name`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/licenses', licensesRouter);

// 주간회의 (WeeklyReports) API
const weeklyReportsRouter = express.Router();
weeklyReportsRouter.get('/', (req, res) => db.all(`SELECT * FROM WeeklyReports ORDER BY meetingDate DESC`, [], (err, rows) => err ? handleDbError(res, err) : res.json(rows)));
app.use('/api/weekly-reports', weeklyReportsRouter);

// --- 서버 시작 ---
app.listen(PORT, () => {
    console.log("======================================================");
    console.log("     프로젝트 제네시스 - 통합 API 서버 가동 v2.2      ");
    console.log("======================================================");
    console.log(`> 사이드바 9개 메뉴 전체에 대한 API가 준비되었습니다.`);
    console.log(`> 지휘소(백엔드 서버)가 포트 ${PORT}에서 정상 가동 중입니다.`);
});