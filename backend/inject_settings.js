/**
 * [일회성 실행 스크립트] SystemSettings 테이블에 회사 정보를 주입합니다.
 * 'backend' 폴더에서 'npm run inject-settings' 명령으로 실행합니다.
 */
import sqlite3 from 'sqlite3';
import path from 'path';

// --- 1. 여기에 실제 회사 정보를 입력하세요 ---
const companyData = {
    companyName: "(주)프로젝트 제네시스",
    companyCeoName: "김대표",
    companyAddress: "제주특별자치도 제주시 첨단로 242",
    companyBusinessNumber: "123-45-67890",
    companyPhoneNumber: "064-123-4567",
    // 중요: 아래 경로는 backend 폴더를 기준으로 한 상대 경로여야 합니다.
    // 예: backend/templates/seals/company_seal.png 파일이 있다면,
    // '/templates/seals/company_seal.png' 로 입력합니다.
    companySealUrl: "/templates/seals/company_seal.png",
    companyUsageSealUrl: "/templates/seals/usage_seal.png" 
};
// -----------------------------------------

const DB_PATH = path.resolve(process.cwd(), 'database.db');

const db = new (sqlite3.verbose().Database)(DB_PATH, (err) => {
  if (err) {
    console.error(`❌ 데이터베이스 연결 실패: ${err.message}`);
    return;
  }
  console.log(`✅ 데이터베이스 '${DB_PATH}'에 성공적으로 연결되었습니다.`);
});

const sql = `
    UPDATE SystemSettings
    SET 
        companyName = ?,
        companyCeoName = ?,
        companyAddress = ?,
        companyBusinessNumber = ?,
        companyPhoneNumber = ?,
        companySealUrl = ?,
        companyUsageSealUrl = ?,
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = 1
`;

const params = [
    companyData.companyName,
    companyData.companyCeoName,
    companyData.companyAddress,
    companyData.companyBusinessNumber,
    companyData.companyPhoneNumber,
    companyData.companySealUrl,
    companyData.companyUsageSealUrl
];

db.run(sql, params, function(err) {
    if (err) {
        console.error('❌ 데이터 주입 중 오류 발생:', err.message);
    } else {
        if (this.changes === 0) {
            console.warn('⚠️ 경고: 업데이트된 행이 없습니다. SystemSettings 테이블에 id=1인 행이 존재하는지 확인하십시오.');
        } else {
            console.log('🎉 회사 정보가 성공적으로 데이터베이스에 주입되었습니다.');
            console.log('================================================');
            console.log('이제 프론트엔드에서 문서 생성을 다시 시도할 수 있습니다.');
            console.log('================================================');
        }
    }
    db.close();
});