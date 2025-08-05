import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

const queries = [
  // 1. 면허 테이블
  `CREATE TABLE IF NOT EXISTS Licenses (
    licenseId INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL UNIQUE,
    industryCode TEXT,
    licenseNumber TEXT,
    licenseFileUrl TEXT,
    legalBasis_AI TEXT,
    operationalStatus_User TEXT,
    relatedLawUrl TEXT,
    registeredAt DATE,
    expiresAt DATE,
    status TEXT DEFAULT '정상'
  );`,
  // 2. 기술인(직원) 테이블
  `CREATE TABLE IF NOT EXISTS Employees (
    employeeId INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT,
    hireDate DATE,
    residentNumber TEXT, -- 암호화 필요
    photoUrl TEXT,
    status TEXT DEFAULT '재직'
  );`,
  // 3. 프로젝트-면허 연결 테이블
  `CREATE TABLE IF NOT EXISTS ProjectLicenses (
    projectLicenseId INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    licenseId INTEGER NOT NULL,
    FOREIGN KEY (licenseId) REFERENCES Licenses (licenseId) ON DELETE CASCADE
  );`,
  // 4. 면허-기술인 연결 테이블
  `CREATE TABLE IF NOT EXISTS LicenseRequirements (
    requirementId INTEGER PRIMARY KEY AUTOINCREMENT,
    licenseId INTEGER NOT NULL,
    employeeId INTEGER NOT NULL,
    role TEXT, -- 예: '책임기술인', '분야별기술인'
    FOREIGN KEY (licenseId) REFERENCES Licenses (licenseId) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE
  );`
];

db.serialize(() => {
  console.log('🚀 자산 관리 시스템 DB 스키마 구축을 시작합니다...');
  queries.forEach((query, index) => {
    db.run(query, (err) => {
      if (err) console.error(`❌ 쿼리 ${index + 1} 실행 실패:`, err.message);
      else console.log(`✅ 쿼리 ${index + 1} 성공.`);
    });
  });
  db.close((err) => {
    if (err) console.error('❌ DB 연결 종료 실패:', err.message);
    else console.log('🎉 스키마 구축 완료!');
  });
});