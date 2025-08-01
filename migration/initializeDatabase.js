// migration/initializeDatabase.js

// [최종 항복] 함장님의 파일이 'projectsData' (복수형 's')를 export하는 것을 인정하고 그대로 사용합니다.
import { projectsData } from './project-data.js';
import { billingData } from './billing-data.js';

function runAsync(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    if (params === 'finalize') {
      sql.finalize((err) => {
        if (err) reject(err); else resolve();
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) reject(err); else resolve(this);
      });
    }
  });
}

const createTablesQueries = {
  // [수정] projects 테이블 정의에 equity_amount 컬럼 추가
  projects: `CREATE TABLE projects (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL UNIQUE, project_name TEXT NOT NULL, client TEXT, manager TEXT, status TEXT, contract_date DATE, start_date DATE, end_date DATE, contract_amount REAL, equity_amount REAL, billed_amount REAL DEFAULT 0, progress_rate INTEGER DEFAULT 0)`,
  billing_history: `CREATE TABLE billing_history (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL, request_type TEXT, request_date DATE, request_amount REAL, deposit_date DATE, deposit_amount REAL, note TEXT, FOREIGN KEY (project_no) REFERENCES projects (project_no))`,
  special_notes_log: `CREATE TABLE special_notes_log (id INTEGER PRIMARY KEY AUTOINCREMENT, project_no TEXT NOT NULL, note TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_no) REFERENCES projects (project_no))`
};

async function initializeDatabase(db) {
  console.log("데이터베이스 초기화를 시작합니다...");
  await runAsync(db, "BEGIN TRANSACTION");
  try {
    await runAsync(db, "DROP TABLE IF EXISTS projects");
    await runAsync(db, "DROP TABLE IF EXISTS billing_history");
    await runAsync(db, "DROP TABLE IF EXISTS special_notes_log");
    
    await runAsync(db, createTablesQueries.projects);
    await runAsync(db, createTablesQueries.billing_history);
    await runAsync(db, createTablesQueries.special_notes_log);
    console.log("데이터베이스 테이블을 성공적으로 생성했습니다.");

    // [최종 항복] 'projectsData' 변수를 직접 사용합니다.
    const validProjects = projectsData.filter(p => p && p.project_number);
    const seenProjectNos = new Set();
    const uniqueProjects = validProjects.filter(p => { if (seenProjectNos.has(p.project_number)) return false; seenProjectNos.add(p.project_number); return true; });
    
    if (projectsData.length > uniqueProjects.length) {
      console.log(`[정보] 원본 데이터에서 ${projectsData.length - uniqueProjects.length}개의 유효하지 않거나 중복된 항목을 제거했습니다.`);
    }

    // [수정] INSERT 문에 equity_amount 필드 추가
    const projectStmt = db.prepare("INSERT INTO projects (project_no, project_name, client, manager, status, contract_date, start_date, end_date, contract_amount, equity_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const p of uniqueProjects) {
        // [수정] 삽입할 데이터에 p.equity_amount 추가
        await runAsync(projectStmt, [p.project_number, p.project_name, p.client_name, p.remarks, p.status || '진행중', p.contract_date, p.start_date, p.end_date, p.total_amount, p.equity_amount]);
    }
    await runAsync(projectStmt, 'finalize');
    console.log(`성공적으로 ${uniqueProjects.length}개의 실제 프로젝트 데이터를 삽입했습니다.`);

    const validBillings = billingData.filter(b => b && b.project_no);
    const billingStmt = db.prepare("INSERT INTO billing_history (project_no, request_type, request_date, request_amount, deposit_date, deposit_amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)");
    for (const b of validBillings) {
      await runAsync(billingStmt, [b.project_no, b.request_type, b.request_date, b.request_amount, b.deposit_date, b.deposit_amount, b.note]);
    }
    await runAsync(billingStmt, 'finalize');
    console.log(`성공적으로 ${validBillings.length}개의 실제 재무 데이터를 삽입했습니다.`);
    
    await updateProjectFinances(db);
    
    await createAutoNotes(db, uniqueProjects);

    await runAsync(db, "COMMIT");
    console.log("데이터베이스 초기화 및 데이터 이식이 완료되었습니다.");
  } catch (err) {
    console.error("데이터베이스 초기화 중 오류 발생:", err);
    await runAsync(db, "ROLLBACK");
    throw err;
  }
}

async function updateProjectFinances(db) {
    // [수정] equity_amount가 0 또는 NULL일 때 오류가 나지 않도록 COALESCE 함수로 감싸고,
    // contract_amount가 0일 때 나누기 오류를 방지하는 CASE WHEN 구문 추가
    const sql = `
      UPDATE projects 
      SET 
        billed_amount = (
          SELECT COALESCE(SUM(deposit_amount), 0) 
          FROM billing_history 
          WHERE billing_history.project_no = projects.project_no
        ),
        progress_rate = (
          CASE 
            WHEN COALESCE(projects.equity_amount, 0) > 0 THEN 
              CAST(
                (SELECT COALESCE(SUM(deposit_amount), 0) FROM billing_history WHERE billing_history.project_no = projects.project_no) * 100 / projects.equity_amount 
                AS INTEGER
              )
            ELSE 0 
          END
        )`;
    const result = await runAsync(db, sql);
    console.log(`총 입금액 및 기성율 계산/업데이트를 완료했습니다. (${result.changes}건)`);
}

async function createAutoNotes(db, uniqueProjects) {
    const completedProjects = uniqueProjects.filter(p => p.status === '완료');
    const noteStmt = db.prepare("INSERT INTO special_notes_log (project_no, note, created_at) VALUES (?, ?, ?)");
    for (const p of completedProjects) {
        if (p.contract_date) await runAsync(noteStmt, [p.project_number, '[자동] 프로젝트 계약', p.contract_date + ' 09:00:00']);
        if (p.start_date) await runAsync(noteStmt, [p.project_number, '[자동] 프로젝트 착수', p.start_date + ' 09:00:00']);
        if (p.end_date) await runAsync(noteStmt, [p.project_number, '[자동] 프로젝트 완료', p.end_date + ' 18:00:00']);
    }
    await runAsync(noteStmt, 'finalize');
    console.log("'완료' 프로젝트의 자동 이력 생성을 완료했습니다.");
}

export { initializeDatabase, updateProjectFinances };