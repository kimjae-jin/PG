import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

const queries = [
  // [수정] Employees 테이블에 누락된 컬럼들을 모두 추가합니다.
  `CREATE TABLE IF NOT EXISTS Employees (
    employeeId INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeCode TEXT UNIQUE,
    name TEXT NOT NULL,
    birthDate DATE,
    emergencyContact TEXT,
    email TEXT,
    address TEXT,
    hireDate DATE,
    department TEXT,
    position TEXT,
    photoUrl TEXT,
    status TEXT DEFAULT '재직'
  );`,
  // 다른 테이블들은 변경 없습니다.
  `CREATE TABLE IF NOT EXISTS Licenses (licenseId INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT NOT NULL, name TEXT NOT NULL UNIQUE, industryCode TEXT, licenseNumber TEXT, licenseFileUrl TEXT, legalBasis_AI TEXT, operationalStatus_User TEXT, relatedLawUrl TEXT, registeredAt DATE, expiresAt DATE, status TEXT DEFAULT '정상');`,
  `CREATE TABLE IF NOT EXISTS Qualifications (qualificationId INTEGER PRIMARY KEY AUTOINCREMENT, employeeId INTEGER NOT NULL, name TEXT, completedDate DATE, expiryDate DATE, certificateUrl TEXT, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE);`,
  `CREATE TABLE IF NOT EXISTS EmployeeFiles (fileId INTEGER PRIMARY KEY AUTOINCREMENT, employeeId INTEGER NOT NULL, fileType TEXT, fileUrl TEXT, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE);`,
  `CREATE TABLE IF NOT EXISTS ProjectLicenses (projectLicenseId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER NOT NULL, licenseId INTEGER NOT NULL, FOREIGN KEY (licenseId) REFERENCES Licenses (licenseId) ON DELETE CASCADE);`,
  `CREATE TABLE IF NOT EXISTS LicenseRequirements (requirementId INTEGER PRIMARY KEY AUTOINCREMENT, licenseId INTEGER NOT NULL, employeeId INTEGER NOT NULL, role TEXT, FOREIGN KEY (licenseId) REFERENCES Licenses (licenseId) ON DELETE CASCADE, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE);`
];

db.serialize(() => {
  console.log('🚀 자산 관리 시스템 DB 스키마 (수정본) 구축을 시작합니다...');
  
  // 재건축을 위해 기존 테이블을 안전하게 삭제
  db.run("DROP TABLE IF EXISTS LicenseRequirements;");
  db.run("DROP TABLE IF EXISTS ProjectLicenses;");
  db.run("DROP TABLE IF EXISTS EmployeeFiles;");
  db.run("DROP TABLE IF EXISTS Qualifications;");
  db.run("DROP TABLE IF EXISTS Employees;");
  db.run("DROP TABLE IF EXISTS Licenses;");
  console.log("🧹 기존 자산 관련 테이블을 모두 초기화했습니다.");

  queries.forEach((query, index) => {
    db.run(query, (err) => {
      if (err) console.error(`❌ 쿼리 ${index + 1} 실행 실패:`, err.message);
      else console.log(`✅ 쿼리 ${index + 1} 성공.`);
    });
  });
  db.close((err) => {
    if (err) console.error('❌ DB 연결 종료 실패:', err.message);
    else console.log('🎉 스키마 재구축 완료!');
  });
});