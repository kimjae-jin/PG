// data.js
export let engineers = [];
export let projects = [];
export let businessLicenses = []; // 업면허 데이터 배열 추가
export let weeklyMeetings = []; // 주간회의 데이터 배열 추가

export let currentEngineerId = { id: null };
export let currentProjectId = { id: null };
export let currentBusinessLicenseId = { id: null }; // 현재 선택된 업면허 ID
export let currentWeeklyMeetingId = { id: null }; // 현재 선택된 주간회의 ID

// 데이터 업데이트 함수
export function updateEngineers(newEngineers) {
    engineers = newEngineers;
}

export function updateProjects(newProjects) {
    projects = newProjects;
}

export function updateBusinessLicenses(newLicenses) {
    businessLicenses = newLicenses;
}

export function updateWeeklyMeetings(newMeetings) {
    weeklyMeetings = newMeetings;
}

// 현재 ID 업데이트 함수
export function updateCurrentEngineerId(id) {
    currentEngineerId.id = id;
}

export function updateCurrentProjectId(id) {
    currentProjectId.id = id;
}

export function updateCurrentBusinessLicenseId(id) {
    currentBusinessLicenseId.id = id;
}

export function updateCurrentWeeklyMeetingId(id) {
    currentWeeklyMeetingId.id = id;
}
