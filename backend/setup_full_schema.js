import sqlite3 from 'sqlite3';
import path from 'path';
const DB_PATH = path.resolve(process.cwd(), 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

// Employees, Licenses 테이블은 이미 생성되었을 수 있으므로 IF NOT EXISTS 사용
const queries = [
  `CREATE TABLE IF NOT EXISTS Employees ( employeeId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, position TEXT, status TEXT DEFAULT '재직' );`,
  `CREATE TABLE IF NOT EXISTS Licenses ( licenseId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, category TEXT, licenseNumber TEXT, status TEXT DEFAULT '정상' );`,
  // Invoices: 기존 billing_history를 대체할 새로운 모델
  `CREATE TABLE IF NOT EXISTS Invoices ( invoiceId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER NOT NULL, content TEXT, amount REAL, issueDate DATE, status TEXT DEFAULT '청구' );`,
  // PqEvaluations: 사업수행능력평가
  `CREATE TABLE IF NOT EXISTS PqEvaluations ( pqId INTEGER PRIMARY KEY AUTOINCREMENT, projectName TEXT NOT NULL, clientName TEXT, score REAL, submissionDate DATE );`,
  // BidAnalyses: 입찰분석
  `CREATE TABLE IF NOT EXISTS BidAnalyses ( bidId INTEGER PRIMARY KEY AUTOINCREMENT, bidName TEXT NOT NULL, estimatedPrice REAL, successfulBidPrice REAL, bidDate DATE );`,
  // WeeklyReports: 주간회의
  `CREATE TABLE IF NOT EXISTS WeeklyReports ( reportId INTEGER PRIMARY KEY AUTOINCREMENT, meetingDate DATE, attendees TEXT, content TEXT, generatedFileUrl TEXT );`
];

db.serialize(() => {
  console.log('🚀 전체 API를 위한 DB 스키마 최종 확장을 시작합니다...');
  queries.forEach((query, i) => db.run(query, (err) => {
    if (err) console.error(`❌ 쿼리 ${i+1} 실패:`, err.message);
    else console.log(`✅ 쿼리 ${i+1} 성공.`);
  }));
  db.close(() => console.log('🎉 최종 스키마 구축 완료!'));
});