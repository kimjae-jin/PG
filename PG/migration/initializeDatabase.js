import { projectsData } from './project-data.js';
import { billingData } from './billing-data.js';
import { legacyNotesText } from './legacy-notes-data.js';

const createTablesQueries = {
    companies: `CREATE TABLE companies (id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT DEFAULT '정상', name TEXT NOT NULL UNIQUE, registration_number TEXT, corporate_number TEXT, address TEXT, phone_number TEXT, ceo_name TEXT, contract_manager_name TEXT, contract_manager_phone TEXT, contract_manager_email TEXT, work_manager_name TEXT, work_manager_phone TEXT, work_manager_email TEXT, special_notes TEXT, remarks TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    projects: `CREATE TABLE projects (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL UNIQUE, project_name TEXT NOT NULL, client TEXT, manager TEXT, status TEXT, contract_date DATE, start_date DATE, end_date DATE, completion_date DATE, contract_amount REAL, equity_amount REAL, billed_amount REAL DEFAULT 0, progress_rate INTEGER DEFAULT 0, special_notes TEXT, remarks TEXT)`,
    billing_history: `CREATE TABLE billing_history (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL, request_type TEXT, request_date DATE, request_amount REAL, deposit_date DATE, deposit_amount REAL, note TEXT, FOREIGN KEY (project_no) REFERENCES projects (project_no))`,
    special_notes_log: `CREATE TABLE special_notes_log (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL, note TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_no) REFERENCES projects (project_no))`,
    sub_contracts: `
        CREATE TABLE sub_contracts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            contract_name TEXT NOT NULL,
            contract_date DATE,
            contract_amount REAL,
            contract_type TEXT,
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        )`
};

function getLegacyDataMap() {
    const dataMap = new Map();
    const lines = legacyNotesText.trim().split('\n');
    lines.forEach(line => {
        const columns = line.split('\t');
        if (columns.length >= 15) {
            const projectNo = columns[0].trim();
            const manager = columns[13].trim();
            let note = columns[14].trim().replace(/"/g, '');
            if (projectNo) {
                if (columns[0].toLowerCase().includes('외주')) {
                    note = `${columns[2].trim()}: ${note}`;
                }
                if (dataMap.has(projectNo)) {
                    const existingData = dataMap.get(projectNo);
                    if (note) existingData.notes.push(note);
                } else {
                    dataMap.set(projectNo, { 
                        manager: manager || null, 
                        notes: note ? [note] : [] 
                    });
                }
            }
        }
    });
    return dataMap;
}

function extractUniqueCompanies(projectList) {
    const companyNames = new Set();
    projectList.forEach(p => {
        if (p.client_name) {
            const normalizedName = p.client_name.replace(/\(주\)|주식회사|\(유\)|유한회사/g, '').trim();
            if (normalizedName) {
                companyNames.add(normalizedName);
            }
        }
    });
    return Array.from(companyNames);
}

async function generateAutomaticLogs(db, legacyData) {
    console.log("자동 로그 생성을 시작합니다...");
    const logStmt = db.prepare("INSERT INTO special_notes_log (project_no, note, created_at) VALUES (?, ?, ?)");
    const projects = await new Promise((res, rej) => db.all("SELECT project_no, contract_date, start_date, completion_date FROM projects", [], (e, r) => e ? rej(e) : res(r)));
    const billings = await new Promise((res, rej) => db.all("SELECT project_no, request_date, deposit_date FROM billing_history", [], (e, r) => e ? rej(e) : res(r)));
    const formatDate = (dateString) => { if (!dateString) return null; const date = new Date(dateString); if (isNaN(date.getTime())) return null; return `${date.getFullYear().toString().slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`; };
    
    for (const p of projects) {
        if (p.contract_date) await new Promise((res, rej) => logStmt.run([p.project_no, `[자동] ${formatDate(p.contract_date)} 계약`, p.contract_date], e => e ? rej(e) : res()));
        if (p.start_date) await new Promise((res, rej) => logStmt.run([p.project_no, `[자동] ${formatDate(p.start_date)} 착수`, p.start_date], e => e ? rej(e) : res()));
        if (p.completion_date) await new Promise((res, rej) => logStmt.run([p.project_no, `[자동] ${formatDate(p.completion_date)} 완료`, p.completion_date], e => e ? rej(e) : res()));
    }
    for (const b of billings) {
        if (b.request_date) await new Promise((res, rej) => logStmt.run([b.project_no, `[자동] ${formatDate(b.request_date)} 청구`, b.request_date], e => e ? rej(e) : res()));
        if (b.deposit_date) await new Promise((res, rej) => logStmt.run([b.project_no, `[자동] ${formatDate(b.deposit_date)} 입금`, b.deposit_date], e => e ? rej(e) : res()));
    }
    
    // ================= [핵심 수정] =================
    // 아래의 레거시 데이터 로그 생성 부분을 주석 처리하여 실행되지 않도록 합니다.
    /*
    for (const [project_no, data] of legacyData.entries()) {
        if (data.notes && data.notes.length > 0) {
            for (const singleNote of data.notes) {
                await new Promise((res, rej) => logStmt.run([project_no, singleNote, new Date().toISOString()], e => e ? rej(e) : res()));
            }
        }
    }
    */
    // ===============================================
    
    await new Promise((res, rej) => logStmt.finalize(e => e ? rej(e) : res()));
    console.log("자동 로그 생성을 완료했습니다. (레거시 수동 기록 제외)");
}

export async function initializeDatabase(db) {
  console.log("데이터베이스 초기화를 시작합니다...");
  await new Promise((resolve, reject) => db.run("BEGIN TRANSACTION", err => { if (err) return reject(err); resolve(); }));
  try {
    await new Promise((resolve, reject) => db.run("DROP TABLE IF EXISTS sub_contracts", err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run("DROP TABLE IF EXISTS companies", err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run("DROP TABLE IF EXISTS projects", err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run("DROP TABLE IF EXISTS billing_history", err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run("DROP TABLE IF EXISTS special_notes_log", err => err ? reject(err) : resolve()));
    
    await new Promise((resolve, reject) => db.run(createTablesQueries.companies, err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run(createTablesQueries.projects, err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run(createTablesQueries.billing_history, err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run(createTablesQueries.special_notes_log, err => err ? reject(err) : resolve()));
    await new Promise((resolve, reject) => db.run(createTablesQueries.sub_contracts, err => err ? reject(err) : resolve()));
    console.log("데이터베이스 테이블을 성공적으로 생성했습니다.");

    const legacyData = getLegacyDataMap();
    const validProjects = projectsData.filter(p => p && p.project_number);
    const seenProjectNos = new Set();
    const uniqueProjects = validProjects.filter(p => { if (seenProjectNos.has(p.project_number)) return false; seenProjectNos.add(p.project_number); return true; });
    if (projectsData.length > uniqueProjects.length) {
      console.log(`[정보] 원본 데이터에서 ${projectsData.length - uniqueProjects.length}개의 유효하지 않거나 중복된 항목을 제거했습니다.`);
    }

    const uniqueCompanies = extractUniqueCompanies(uniqueProjects);
    const companyStmt = db.prepare("INSERT INTO companies (name) VALUES (?)");
    for (const companyName of uniqueCompanies) {
        await new Promise((resolve, reject) => companyStmt.run(companyName, err => err ? reject(err) : resolve()));
    }
    await new Promise((resolve, reject) => companyStmt.finalize(err => err ? reject(err) : resolve()));
    console.log(`성공적으로 ${uniqueCompanies.length}개의 고유 관계사 데이터를 생성했습니다.`);

    const projectStmt = db.prepare(`
        INSERT INTO projects (
            project_no, project_name, client, manager, status, contract_date, start_date, end_date, 
            completion_date, contract_amount, equity_amount, remarks, special_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of uniqueProjects) {
        const legacy = legacyData.get(p.project_number);
        const managerFromLegacy = legacy ? legacy.manager : null;
        const normalizedClient = p.client_name ? p.client_name.replace(/\(주\)|주식회사|\(유\)|유한회사/g, '').trim() : '';
        const params = [
            p.project_number, p.project_name, normalizedClient, p.manager || managerFromLegacy, 
            p.status || '진행중', p.contract_date, p.start_date, p.end_date, p.completion_date, 
            p.total_amount, p.equity_amount, p.remarks, null
        ];
        await new Promise((resolve, reject) => projectStmt.run(params, err => err ? reject(err) : resolve()));
    }
    await new Promise((resolve, reject) => projectStmt.finalize(err => err ? reject(err) : resolve()));
    console.log(`성공적으로 ${uniqueProjects.length}개의 실제 프로젝트 데이터를 삽입했습니다.`);

    const validBillings = billingData.filter(b => b && b.project_no);
    const billingStmt = db.prepare("INSERT INTO billing_history (project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const b of validBillings) {
        const params = [b.project_no, b.request_type, b.request_date, b.request_amount, b.deposit_date, b.deposit_amount, b.note];
        await new Promise((resolve, reject) => billingStmt.run(params, err => err ? reject(err) : resolve()));
    }
    await new Promise((resolve, reject) => billingStmt.finalize(err => err ? reject(err) : resolve()));
    console.log(`성공적으로 ${validBillings.length}개의 실제 재무 데이터를 삽입했습니다.`);
    
    console.log("세부 계약 예시 데이터를 삽입합니다...");
    const project74 = await new Promise((res, rej) => db.get("SELECT id FROM projects WHERE project_no = '2023-74'", [], (e,r) => e ? rej(e) : res(r)));
    if (project74) {
        const subContractStmt = db.prepare("INSERT INTO sub_contracts (project_id, contract_name, contract_date, contract_amount, contract_type) VALUES (?, ?, ?, ?, ?)");
        await new Promise((res, rej) => subContractStmt.run([project74.id, '영어교육도시 제2진입도로 건설사업관리용역(1차)', '2024-03-22', 60600000, '준공'], e => e ? rej(e) : res()));
        await new Promise((res, rej) => subContractStmt.run([project74.id, '영어교육도시 제2진입도로 건설공사 건설사업관리용역(2차)', '2024-10-16', 438264000, '변경계약'], e => e ? rej(e) : res()));
        await new Promise((res, rej) => subContractStmt.finalize(e => e ? rej(e) : res()));
        console.log("2023-74 프로젝트에 대한 세부 계약 데이터가 추가되었습니다.");
    }

    await new Promise((resolve, reject) => {
        const sql = `UPDATE projects SET billed_amount = (SELECT COALESCE(SUM(deposit_amount), 0) FROM billing_history WHERE billing_history.project_no = projects.project_no), progress_rate = (CASE WHEN COALESCE(projects.equity_amount, 0) > 0 THEN CAST((SELECT COALESCE(SUM(deposit_amount), 0) FROM billing_history WHERE billing_history.project_no = projects.project_no) * 100 / projects.equity_amount AS INTEGER) ELSE 0 END)`;
        db.run(sql, [], function(err) { if (err) return reject(err); console.log("재무 정보 업데이트 완료."); resolve(); });
    });
    await new Promise((resolve, reject) => {
        const sql = `UPDATE projects SET status = '완료' WHERE status = '진행중' AND progress_rate >= 100`;
        db.run(sql, [], function(err) { if (err) return reject(err); if (this.changes > 0) console.log(`[상태 변경] ${this.changes}개 프로젝트가 '완료' 상태로 업데이트되었습니다.`); resolve(); });
    });
    await new Promise((resolve, reject) => {
        const sql = `UPDATE projects SET completion_date = end_date WHERE completion_date IS NULL AND end_date IS NOT NULL AND end_date < '2025-08-01'`;
        db.run(sql, [], function(err) { if(err) return reject(err); if (this.changes > 0) console.log(`[데이터 보정] ${this.changes}개 프로젝트의 완료일이 자동 기입되었습니다.`); resolve(); });
    });

    await generateAutomaticLogs(db, legacyData);

    await new Promise((resolve, reject) => db.run("COMMIT", err => err ? reject(err) : resolve()));
    console.log("데이터베이스 초기화 및 데이터 이식이 완료되었습니다.");
  } catch (err) {
    console.error("데이터베이스 초기화 중 오류 발생:", err);
    await new Promise((resolve, reject) => db.run("ROLLBACK", e => e ? reject(e) : resolve()));
    throw err;
  }
}

export async function updateProjectFinancesAndStatus(db, projectNo = null) {
    console.log(`[외부 호출] 프로젝트 재무 정보 및 상태 업데이트 시작 (대상: ${projectNo || '모든 프로젝트'})...`);
    const sql = `
      UPDATE projects 
      SET 
        billed_amount = (SELECT COALESCE(SUM(deposit_amount), 0) FROM billing_history WHERE billing_history.project_no = projects.project_no),
        progress_rate = (CASE WHEN COALESCE(projects.equity_amount, 0) > 0 THEN CAST((SELECT COALESCE(SUM(deposit_amount), 0) FROM billing_history WHERE billing_history.project_no = projects.project_no) * 100 / projects.equity_amount AS INTEGER) ELSE 0 END)
      ${projectNo ? `WHERE projects.project_no = ?` : ''}`;
      
    await new Promise((resolve, reject) => {
        db.run(sql, projectNo ? [projectNo] : [], function(err) {
            if (err) return reject(err);
            console.log("재무 정보 업데이트 완료.");
            resolve();
        });
    });
}