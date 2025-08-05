import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'database.db');
const db = new (sqlite3.verbose().Database)(DB_PATH);

console.log('🚀 SystemSettings 테이블 스키마 수정을 시작합니다...');

// ALTER TABLE을 사용하여 누락된 컬럼을 추가합니다.
// IF NOT EXISTS 구문은 ALTER TABLE에서 직접 지원하지 않으므로,
// 우선 컬럼 정보를 읽고 없을 때만 추가하는 방식으로 안전하게 처리합니다.
db.all("PRAGMA table_info(SystemSettings)", (err, columns) => {
    if (err) {
        console.error('❌ 테이블 정보 조회 실패:', err.message);
        db.close();
        return;
    }

    const hasColumn = columns.some(col => col.name === 'companyUsageSealUrl');

    if (hasColumn) {
        console.log('✅ companyUsageSealUrl 컬럼이 이미 존재합니다. 작업을 건너뜁니다.');
        db.close();
    } else {
        console.log('⚠️ companyUsageSealUrl 컬럼이 누락되었습니다. 추가 작업을 실행합니다...');
        db.run("ALTER TABLE SystemSettings ADD COLUMN companyUsageSealUrl TEXT", (err) => {
            if (err) {
                console.error('❌ 컬럼 추가 실패:', err.message);
            } else {
                console.log('🎉 companyUsageSealUrl 컬럼이 성공적으로 추가되었습니다.');
            }
            db.close();
        });
    }
});