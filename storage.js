// storage.js
import { engineers, projects, businessLicenses, weeklyMeetings, // weeklyMeetings 추가
         currentEngineerId, currentProjectId, currentBusinessLicenseId, currentWeeklyMeetingId, // currentWeeklyMeetingId 추가
         updateEngineers, updateProjects, updateBusinessLicenses, updateWeeklyMeetings, // updateWeeklyMeetings 추가
         updateCurrentEngineerId, updateCurrentProjectId, updateCurrentBusinessLicenseId, updateCurrentWeeklyMeetingId } from './data.js'; // updateCurrentWeeklyMeetingId 추가

const STORAGE_KEY = 'technicalPersonnelData';

export function loadAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsedData = JSON.parse(data);
            updateEngineers(parsedData.engineers || []);
            updateProjects(parsedData.projects || []);
            updateBusinessLicenses(parsedData.businessLicenses || []);
            updateWeeklyMeetings(parsedData.weeklyMeetings || []); // 주간회의 데이터 로드

            updateCurrentEngineerId(parsedData.currentEngineerId || null);
            updateCurrentProjectId(parsedData.currentProjectId || null);
            updateCurrentBusinessLicenseId(parsedData.currentBusinessLicenseId || null);
            updateCurrentWeeklyMeetingId(parsedData.currentWeeklyMeetingId || null); // 주간회의 현재 ID 로드
        } catch (e) {
            console.error("Failed to parse data from localStorage:", e);
            // 에러 발생 시 데이터 초기화 (선택 사항, 필요시)
            // saveAllData();
        }
    }
}

export function saveAllData() {
    const dataToSave = {
        engineers: engineers,
        projects: projects,
        businessLicenses: businessLicenses,
        weeklyMeetings: weeklyMeetings, // 주간회의 데이터 저장
        currentEngineerId: currentEngineerId.id,
        currentProjectId: currentProjectId.id,
        currentBusinessLicenseId: currentBusinessLicenseId.id,
        currentWeeklyMeetingId: currentWeeklyMeetingId.id // 주간회의 현재 ID 저장
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}
