/**
 * [최종 수정본] 문서 자동화 시스템을 위한 DB 스키마 확장
 * 이 스크립트는 'backend' 폴더에서 'npm run update-schema' 명령으로 실행합니다.
 * process.cwd()를 사용하여 실행 위치와 관계없이 항상 프로젝트 루트를 기준으로 경로를 설정합니다.
 */
import sqlite3 from 'sqlite3';
import path from 'path';

// 실행 위치(PG/backend)에서 상위 폴더(PG)로 이동한 후, backend/database.db 경로를 조합합니다.
// 이렇게 하면 어디서 실행하든 항상 정확한 DB 파일 경로를 찾을 수 있습니다.
const DB_PATH = path.resolve(process.cwd(), 'database.db');

const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
  if (err) {
    console.error(`❌ 데이터베이스 연결 실패: ${err.message}`);
    console.error(`🔍 시도한 경로: ${DB_PATH}`);
    return;
  }
  console.log(`✅ 데이터베이스 '${DB_PATH}'에 성공적으로 연결되었습니다.`);
});

const sqlQueries = `
CREATE TABLE IF NOT EXISTS SystemSettings (
    id INTEGER PRIMARY KEY CHECK (id = 1), companyName TEXT, companyCeoName TEXT,
    companyAddress TEXT, companyBusinessNumber TEXT, companyPhoneNumber TEXT,
    companySealUrl TEXT, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS DocumentTemplate (
    templateId INTEGER PRIMARY KEY AUTOINCREMENT, engineType TEXT NOT NULL,
    templateName TEXT NOT NULL UNIQUE, templateDisplayName TEXT NOT NULL,
    templateCategory TEXT, templateFileUrl TEXT NOT NULL, clientId INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS GeneratedDocument (
    documentId INTEGER PRIMARY KEY AUTOINCREMENT, projectId TEXT NOT NULL,
    templateId INTEGER NOT NULL, generatedFileUrl TEXT NOT NULL,
    version INTEGER DEFAULT 1 NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT OR IGNORE INTO SystemSettings (id) VALUES (1);
`;

db.serialize(() => {
  console.log('🚀 스키마 업데이트를 시작합니다...');
  db.exec(sqlQueries, (err) => {
    if (err) {
      console.error('❌ 스키마 업데이트 중 오류 발생:', err.message);
    } else {
      console.log('✅ 모든 테이블이 성공적으로 생성/확인되었습니다.');
    }
    db.close((err) => {
      if (err) console.error('❌ 데이터베이스 연결 종료 실패:', err.message);
      else console.log('🔌 데이터베이스 연결이 안전하게 종료되었습니다.');
    });
  });
});