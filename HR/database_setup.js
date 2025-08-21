import sqlite3Verbose from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3 = sqlite3Verbose.verbose();
const dbPath = path.resolve(__dirname, 'database.db');

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('기존 데이터베이스 파일을 파괴하고, 새로운 법전 제정을 시작합니다.');
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('데이터베이스에 성공적으로 연결되었습니다. 스키마 생성을 시작합니다.');
    setupDatabase();
  }
});

function setupDatabase() {
  db.serialize(() => {
    console.log('=== 재설계된 성법 v2.1 제정 시작 ===');
    db.run(`CREATE TABLE Employees ( employeeId INTEGER PRIMARY KEY AUTOINCREMENT, employeeName TEXT NOT NULL, residentRegistrationNumber TEXT, finalEducation TEXT, finalEducationFileUrl TEXT, koceaCareerDbId TEXT, remarks TEXT )`, (err) => { if (err) console.error("Error creating Employees table", err); else console.log("Table 'Employees' created."); });
    db.run(`CREATE TABLE Licenses ( licenseId INTEGER PRIMARY KEY AUTOINCREMENT, licenseName TEXT NOT NULL, licenseNumber TEXT, issuingAuthority TEXT, acquisitionDate TEXT, renewalCycle TEXT, renewalDate TEXT, legalStandard TEXT, appliedPersonnel TEXT, licenseProofFileUrl TEXT )`, (err) => { if (err) console.error("Error creating Licenses table", err); else console.log("Table 'Licenses' created."); });
    db.run(`CREATE TABLE Clients ( clientId INTEGER PRIMARY KEY AUTOINCREMENT, businessRegistrationNumber TEXT UNIQUE, corporateRegistrationNumber TEXT, clientName TEXT NOT NULL, address TEXT, contactNumber TEXT, accountingContactName TEXT, accountingContactEmail TEXT, accountingContactPhone TEXT, accountingContactBusinessCardUrl TEXT, businessContactName TEXT, businessContactEmail TEXT, businessContactPhone TEXT, businessContactBusinessCardUrl TEXT, businessRegistrationFileUrl TEXT, remarks TEXT )`, (err) => { if (err) console.error("Error creating Clients table", err); else console.log("Table 'Clients' created."); });
    db.run(`CREATE TABLE Projects ( projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectIdentifier TEXT UNIQUE, projectName TEXT NOT NULL, projectCategory TEXT, pmName TEXT, completionDate TEXT, projectLocation TEXT, summary TEXT, facilityType TEXT, status TEXT DEFAULT '진행중', createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT DEFAULT CURRENT_TIMESTAMP )`, (err) => { if (err) console.error("Error creating Projects table", err); else console.log("Table 'Projects' created."); });
    db.run(`CREATE TABLE ProjectClients ( projectClientId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER NOT NULL, clientId INTEGER NOT NULL, clientRole TEXT NOT NULL, FOREIGN KEY (projectId) REFERENCES Projects (projectId) ON DELETE CASCADE, FOREIGN KEY (clientId) REFERENCES Clients (clientId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating ProjectClients table", err); else console.log("Table 'ProjectClients' created."); });
    db.run(`CREATE TABLE Contracts ( contractId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER NOT NULL, contractType TEXT, contractDate TEXT, startDate TEXT, endDate TEXT, totalAmount REAL, supplyAmount REAL, vatAmount REAL, totalEquityAmount REAL, equityRatio REAL, contractFileUrl TEXT, remarks TEXT, FOREIGN KEY (projectId) REFERENCES Projects (projectId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating Contracts table", err); else console.log("Table 'Contracts' created."); });
    db.run(`CREATE TABLE ContractRevisions ( revisionId INTEGER PRIMARY KEY AUTOINCREMENT, contractId INTEGER NOT NULL, revisionDate TEXT, revisedStartDate TEXT, revisedEndDate TEXT, finalEndDate TEXT, revisedTotalAmount REAL, revisedTotalEquityAmount REAL, revisedEquityRatio REAL, revisionProofFileUrl TEXT, revisionContractFileUrl TEXT, changeReason TEXT, revisionNumber INTEGER, FOREIGN KEY (contractId) REFERENCES Contracts (contractId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating ContractRevisions table", err); else console.log("Table 'ContractRevisions' created."); });
    db.run(`CREATE TABLE Invoices ( invoiceId INTEGER PRIMARY KEY AUTOINCREMENT, contractId INTEGER NOT NULL, invoiceContent TEXT, invoiceAmount REAL, invoiceDate TEXT, paymentDate TEXT, paymentAmount REAL, taxInvoiceDate TEXT, taxInvoiceAmount REAL, specialNotes TEXT, FOREIGN KEY (contractId) REFERENCES Contracts (contractId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating Invoices table", err); else console.log("Table 'Invoices' created."); });
    db.run(`CREATE TABLE Quotations ( quotationId INTEGER PRIMARY KEY AUTOINCREMENT, quotationNumber TEXT, quotationContent TEXT, provisionalContractName TEXT, quotationAmount REAL, recipientName TEXT, recipientContact TEXT, recipientEmail TEXT, relatedDataFileUrl TEXT, remarks TEXT )`, (err) => { if (err) console.error("Error creating Quotations table", err); else console.log("Table 'Quotations' created."); });
    db.run(`CREATE TABLE ProjectParticipants ( participantId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER NOT NULL, employeeId INTEGER NOT NULL, jobField TEXT, specialtyField TEXT, position TEXT, responsibilities TEXT, responsibilityLevel TEXT, specialNotes TEXT, FOREIGN KEY (projectId) REFERENCES Projects (projectId) ON DELETE CASCADE, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating ProjectParticipants table", err); else console.log("Table 'ProjectParticipants' created."); });
    db.run(`CREATE TABLE Qualifications ( qualificationId INTEGER PRIMARY KEY AUTOINCREMENT, employeeId INTEGER NOT NULL, qualificationName TEXT NOT NULL, acquisitionDate TEXT, expirationDate TEXT, qualificationFileUrl TEXT, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating Qualifications table", err); else console.log("Table 'Qualifications' created."); });
    db.run(`CREATE TABLE Trainings ( trainingId INTEGER PRIMARY KEY AUTOINCREMENT, employeeId INTEGER NOT NULL, trainingName TEXT NOT NULL, trainingDate TEXT, trainingInstitution TEXT, requiredCycle TEXT, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating Trainings table", err); else console.log("Table 'Trainings' created."); });
    db.run(`CREATE TABLE Equipment ( equipmentId INTEGER PRIMARY KEY AUTOINCREMENT, licenseId INTEGER NOT NULL, equipmentName TEXT NOT NULL, modelNumber TEXT, calibrationDate TEXT, nextCalibrationDate TEXT, calibrationCertificateUrl TEXT, FOREIGN KEY (licenseId) REFERENCES Licenses (licenseId) ON DELETE CASCADE )`, (err) => { if (err) console.error("Error creating Equipment table", err); else console.log("Table 'Equipment' created."); });
    db.run(`CREATE TABLE IndividualPerformance ( performanceId INTEGER PRIMARY KEY AUTOINCREMENT, employeeId INTEGER NOT NULL, projectId INTEGER NOT NULL, performanceDetails TEXT, FOREIGN KEY (employeeId) REFERENCES Employees (employeeId) ON DELETE CASCADE, FOREIGN KEY (projectId) REFERENCES Projects (projectId) ON DELETE CASCADE )`, (err) => {
        if (err) console.error("Error creating IndividualPerformance table", err); else console.log("Table 'IndividualPerformance' created.");
        console.log('=== 재설계된 성법 v2.1 제정 완료 ===');
        db.close((closeErr) => { if (closeErr) console.error('DB 연결 종료 오류:', closeErr.message); else console.log('데이터베이스 연결이 안전하게 종료되었습니다.'); });
    });
  });
}