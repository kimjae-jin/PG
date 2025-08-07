import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- [치명적 오류 수정: 경로를 한 단계 위로 조준] ---
const SOURCE_DIR = path.join(__dirname, '..', 'migration'); // 'backend'에서 나와 루트의 'migration'으로 이동
const TARGET_DIR = path.join(__dirname, '..', 'data_migration');
const OUTPUT_FILE = path.join(TARGET_DIR, 'employees_master.json');
// ----------------------------------------------------

const HEADER_MAP = { '이름': 'name', '사번': 'employeeId', '생년월일': 'dateOfBirth', '비상연락망': 'emergencyContact', '이메일': 'email', '소속부서': 'department', '직책': 'position', '입사일': 'hireDate', '주소': 'address'};

function normalizeDate(dateString) {
    if (!dateString) return null;
    const cleaned = dateString.replace(/년|월/g, '-').replace(/일/g, '').replace(/\s/g, '');
    try { const date = new Date(cleaned); return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; } catch(e) { return null; }
}

console.log("CSV 데이터 정제 시작...");

try {
    const files = fs.readdirSync(SOURCE_DIR);
    const csvFile = files.find(file => file.endsWith('.csv') && file.startsWith('사원현황'));
    
    if (!csvFile) {
        console.error(`❌ 'PG/migration' 폴더에서 '사원현황'으로 시작하는 CSV 파일을 찾을 수 없습니다.`);
        process.exit(1);
    }
    
    const INPUT_FILE = path.join(SOURCE_DIR, csvFile);
    console.log(`🔍 대상 파일 발견: ${INPUT_FILE}`);

    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });

    const processedData = records.map(record => {
        const newRecord = {};
        for (const key in record) {
            if (HEADER_MAP[key]) {
                newRecord[HEADER_MAP[key]] = record[key] || null;
            }
        }
        newRecord.dateOfBirth = normalizeDate(newRecord.dateOfBirth);
        newRecord.hireDate = normalizeDate(newRecord.hireDate);
        return newRecord;
    });

    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedData, null, 2));
    console.log(`✅ 성공: ${records.length}명의 사원 데이터가 ${OUTPUT_FILE}에 저장되었습니다.`);

} catch (error) {
    console.error("🔥 데이터 정제 중 오류 발생", error);
}