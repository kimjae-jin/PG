// components.js
import { engineers, projects, businessLicenses, weeklyMeetings,
         currentEngineerId, currentProjectId, currentBusinessLicenseId, currentWeeklyMeetingId,
         updateEngineers, updateProjects, updateBusinessLicenses, updateWeeklyMeetings,
         updateCurrentEngineerId, updateCurrentProjectId, updateCurrentBusinessLicenseId, updateCurrentWeeklyMeetingId } from './data.js';
import { saveAllData } from './storage.js';

let localEngineers = [];
let localProjects = [];
let localBusinessLicenses = [];
let localWeeklyMeetings = [];

let localCurrentEngineerId = null;
let localCurrentProjectId = null;
let localCurrentBusinessLicenseId = null;
let localCurrentWeeklyMeetingId = null;

export function updateComponentData(engData, projData, bizData, weeklyData, currentEngId, currentProjId, currentBizId, currentWeeklyId) {
    localEngineers = engData;
    localProjects = projData;
    localBusinessLicenses = bizData;
    localWeeklyMeetings = weeklyData;

    localCurrentEngineerId = currentEngId;
    localCurrentProjectId = currentProjId;
    localCurrentBusinessLicenseId = currentBizId;
    localCurrentWeeklyMeetingId = currentWeeklyId;
}

// 기술인 관리 컴포넌트 렌더링 함수
export function renderEngineerContent() {
    const engineerPanel = document.getElementById('engineerPanel');
    if (engineerPanel) {
        engineerPanel.innerHTML = `
            <div class="panel-content-wrapper h-full">
                <div class="panel-header">
                    <h3 class="text-2xl font-bold text-primary">기술인 목록</h3>
                    <button id="addEngineerBtn" class="btn-primary">+ 추가</button>
                </div>
                <div class="panel-list-container">
                    <ul id="engineerList" class="space-y-2">
                        <li class="text-secondary p-2 list-item">등록된 기술인이 없습니다.</li>
                    </ul>
                </div>
                <div id="engineerFormContainer" class="panel-form-container hidden">
                    </div>
            </div>
        `;
    }
    console.log("Engineer Content Rendered.");
    // 여기에 리스트 렌더링 함수 호출 및 이벤트 리스너 추가 로직이 들어갑니다.
    // 예시: renderEngineerList();
    // document.getElementById('addEngineerBtn').addEventListener('click', () => { /* 폼 보여주기 로직 */ });
}

export function renderEngineerList() {
    // 실제 기술인 데이터를 기반으로 목록을 렌더링하는 로직 (다음 단계에서 구현)
    console.log("Engineer List Rendered (placeholder)");
}

export function renderEngineerForm(engineer) {
    // 실제 기술인 상세 폼을 렌더링하는 로직 (다음 단계에서 구현)
    console.log("Engineer Form Rendered (placeholder)");
}


// 프로젝트 관리 컴포넌트 렌더링 함수
export function renderProjectContent() {
    const projectPanel = document.getElementById('projectPanel');
    if (projectPanel) {
        projectPanel.innerHTML = `
            <div class="panel-content-wrapper h-full">
                <div class="panel-header">
                    <h3 class="text-2xl font-bold text-primary">프로젝트 목록</h3>
                    <button id="addProjectBtn" class="btn-primary">+ 추가</button>
                </div>
                <div class="panel-list-container">
                    <ul id="projectList" class="space-y-2">
                        <li class="text-secondary p-2 list-item">등록된 프로젝트가 없습니다.</li>
                    </ul>
                </div>
                <div id="projectFormContainer" class="panel-form-container hidden">
                    </div>
            </div>
        `;
    }
    console.log("Project Content Rendered.");
}

export function renderProjectList() {
    console.log("Project List Rendered (placeholder)");
}

export function renderProjectForm(project) {
    console.log("Project Form Rendered (placeholder)");
}


// 업면허 관리 컴포넌트 렌더링 함수
export function renderBusinessLicenseContent() {
    const businessLicensePanel = document.getElementById('businessLicensePanel');
    if (businessLicensePanel) {
        businessLicensePanel.innerHTML = `
            <div class="panel-content-wrapper h-full">
                <div class="panel-header">
                    <h3 class="text-2xl font-bold text-primary">업면허 목록</h3>
                    <button id="addBusinessLicenseBtn" class="btn-primary">+ 추가</button>
                </div>
                <div class="panel-list-container">
                    <ul id="businessLicenseList" class="space-y-2">
                        <li class="text-secondary p-2 list-item">등록된 업면허가 없습니다.</li>
                    </ul>
                </div>
                <div id="businessLicenseFormContainer" class="panel-form-container hidden">
                    </div>
            </div>
        `;
    }
    console.log("Business License Content Rendered.");
}

export function renderBusinessLicenseList() {
    console.log("Business License List Rendered (placeholder)");
}

export function renderBusinessLicenseForm(businessLicense) {
    console.log("Business License Form Rendered (placeholder)");
}

// 주간회의 관리 컴포넌트 렌더링 함수
export function renderWeeklyMeetingContent() {
    const weeklyMeetingPanel = document.getElementById('weeklyMeetingPanel');
    if (weeklyMeetingPanel) {
        weeklyMeetingPanel.innerHTML = `
            <div class="panel-content-wrapper h-full flex items-center justify-center">
                <p class="text-3xl font-bold text-secondary">주간회의: 준비중...</p>
            </div>
        `;
    }
    console.log("Weekly Meeting Content Rendered (준비중).");
}

export function renderWeeklyMeetingList() {
    // 주간회의는 준비중이므로 목록 렌더링 없음
}

export function renderWeeklyMeetingForm(meeting) {
    // 주간회의는 준비중이므로 폼 렌더링 없음
}

// 테마 관리 컴포넌트 렌더링 함수
export function renderThemeContent() {
    const themePanel = document.getElementById('themePanel');
    if (themePanel) {
        themePanel.innerHTML = `
            <div class="panel-content-wrapper h-full">
                <div class="panel-header">
                    <h3 class="text-2xl font-bold text-primary">테마 선택</h3>
                </div>
                <div class="flex flex-col space-y-4">
                    <button id="selectStarbucksThemeBtn" class="btn-primary">스타벅스 테마 적용</button>
                    <button id="selectAppleThemeBtn" class="btn-primary">애플 테마 적용</button>
                </div>
            </div>
        `;
    }
    console.log("Theme Content Rendered.");
}
