import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';

// --- 설정 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// [최종 수정] 'source' 하위 폴더를 경로에 추가
const CSV_FILE_PATH = path.resolve(__dirname, '..', 'data_migration', 'source', '사원현황 1fc8d0454de98052a5b8f375cc4768ab_all.csv');
const DB_PATH = path.resolve(__dirname, 'database.db'); 

// CSV 헤더 정의
const HEADERS = [
    'name', 'employeeCode', 'birthDate', 'emergencyContact', 'email', 'department', 'position', 'hireDate', 'address',
    'file_graduation', 'file_license', 'remarks', 'edu_safety_date', 'edu_disaster_date', 'edu_construction_2_date',
    'edu_construction_1_date', 'file_disaster_cert', 'file_disaster_proof', 'file_safety_cert', 'file_construction_2_cert',
    'file_construction_1_cert', 'validity_construction_1', 'validity_construction_2', 'HOR_List', 'validity_disaster', 'validity_safety'
];

async function main() {
    console.log(`🚀 기술인 데이터 이식을 시작합니다: '${CSV_FILE_PATH}'`);

    if (!fs.existsSync(CSV_FILE_PATH)) {
        console.error(`❌ 치명적 오류: 데이터 파일이 다음 경로에 존재하지 않습니다.`);
        console.error(CSV_FILE_PATH);
        return;
    }

    const records = [];
    const parser = fs.createReadStream(CSV_FILE_PATH)
        .pipe(parse({
            delimiter: ',',
            columns: HEADERS,
            from_line: 2 
        }));

    for await (const record of parser) {
        records.push(record);
    }
    console.log(`✅ CSV 파일에서 총 ${records.length}명의 기술인 데이터를 읽었습니다.`);

    const db = new (sqlite3.verbose().Database)(DB_PATH);
    
    const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });

    console.log('⏳ 데이터베이스에 정보를 이식합니다...');
    let successCount = 0;

    await dbRun("BEGIN TRANSACTION", []);
    await dbRun("DELETE FROM Qualifications;");
    await dbRun("DELETE FROM EmployeeFiles;");
    await dbRun("DELETE FROM Employees;");
    console.log("🧹 기존 기술인 관련 테이블을 모두 비웠습니다.");

    for (const record of records) {
        if (!record.name || record.name.trim() === '') continue;
        try {
            const employeeId = await dbRun(
                `INSERT INTO Employees (employeeCode, name, birthDate, emergencyContact, email, department, position, hireDate, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [record.employeeCode, record.name, record.birthDate, record.emergencyContact, record.email, record.department, record.position, record.hireDate, record.address]
            );

            const qualifications = [
                { name: '건설교육1차', date: record.edu_construction_1_date, expiry: record.validity_construction_1, file: record.file_construction_1_cert },
                { name: '건설교육2차', date: record.edu_construction_2_date, expiry: record.validity_construction_2, file: record.file_construction_2_cert },
                { name: '방재교육', date: record.edu_disaster_date, expiry: record.validity_disaster, file: record.file_disaster_cert },
                { name: '안전진단교육', date: record.edu_safety_date, expiry: record.validity_safety, file: record.file_safety_cert }
            ];
            for (const q of qualifications) {
                if (q.date && q.date.trim() !== '') {
                    await dbRun(`INSERT INTO Qualifications (employeeId, name, completedDate, expiryDate, certificateUrl) VALUES (?, ?, ?, ?, ?)`,[employeeId, q.name, q.date, q.expiry, q.file]);
                }
            }
            
            const files = [
                { type: '졸업증명서', url: record.file_graduation },
                { type: '자격증', url: record.file_license },
                { type: '방재인증서', url: record.file_disaster_proof }
            ];
            for (const f of files) {
                if (f.url && f.url.trim() !== '') {
                    await dbRun(`INSERT INTO EmployeeFiles (employeeId, fileType, fileUrl) VALUES (?, ?, ?)`,[employeeId, f.type, f.url]);
                }
            }
            successCount++;
            console.log(`  - ${record.name} (${record.employeeCode}) 정보 이식 완료.`);
        } catch (err) {
             console.error(`  [오류] ${record.name} 정보 처리 중 오류 발생:`, err.message);
        }
    }
    
    await dbRun("COMMIT", []);
    db.close();

    console.log("\n" + "="*50);
    console.log("🎉 데이터 이식 작전 완료!");
    console.log(`- 성공적으로 처리된 기술인: ${successCount} 명`);
    console.log("====================================================");
}

main().catch(err => console.error("❌ 치명적인 오류 발생:", err));