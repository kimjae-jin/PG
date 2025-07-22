// main.js
import { engineers, projects, businessLicenses, weeklyMeetings,
         currentEngineerId, currentProjectId, currentBusinessLicenseId, currentWeeklyMeetingId,
         updateEngineers, updateProjects, updateBusinessLicenses, updateWeeklyMeetings,
         updateCurrentEngineerId, updateCurrentProjectId, updateCurrentBusinessLicenseId, updateCurrentWeeklyMeetingId } from './data.js';
import { saveAllData, loadAllData } from './storage.js';
import { renderEngineerContent, renderProjectContent, renderBusinessLicenseContent, renderWeeklyMeetingContent, renderThemeContent, updateComponentData } from './components.js';

// renderHomeContent 함수를 main.js 내부에 직접 정의
function renderHomeContent() {
    const homePanel = document.getElementById('homePanel');
    if (homePanel) {
        homePanel.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; font-size: 2em; font-weight: bold; color: #333; background-color: #f0f2f5;">
                Coming Soon! (추후 공개예정)
            </div>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // 1. 데이터 로드 (가장 먼저 수행)
    loadAllData();
    // 로드된 데이터를 components.js의 내부 상태로 업데이트
    updateComponentData(engineers, projects, businessLicenses, weeklyMeetings, currentEngineerId.id, currentProjectId.id, currentBusinessLicenseId.id, currentWeeklyMeetingId.id);


    // 2. 다크 모드 토글 기능
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement; // <html> 태그

    // 저장된 다크/라이트 모드 설정 불러오기 및 초기 적용
    const savedDarkModePreference = localStorage.getItem('darkMode');
    if (savedDarkModePreference === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            if (htmlElement.classList.contains('dark')) {
                localStorage.setItem('darkMode', 'dark');
            } else {
                localStorage.setItem('darkMode', 'light');
            }
        });
    }

    // 3. 사이드바 메뉴 전환 로직
    const pgHomeBtn = document.getElementById('pgHomeBtn'); // PG 헤더 버튼
    const projectTabBtn = document.getElementById('projectTabBtn');
    const engineerTabBtn = document.getElementById('engineerTabBtn');
    const businessLicenseTabBtn = document.getElementById('businessLicenseTabBtn');
    const weeklyMeetingTabBtn = document.getElementById('weeklyMeetingTabBtn');
    const themeTabBtn = document.getElementById('themeTabBtn');

    const homePanel = document.getElementById('homePanel'); // 홈 패널
    const projectPanel = document.getElementById('projectPanel');
    const engineerPanel = document.getElementById('engineerPanel');
    const businessLicensePanel = document.getElementById('businessLicensePanel');
    const weeklyMeetingPanel = document.getElementById('weeklyMeetingPanel');
    const themePanel = document.getElementById('themePanel');

    // 사이드바 버튼 목록 (PG 헤더는 포함하지 않음)
    const sidebarButtons = [projectTabBtn, engineerTabBtn, businessLicenseTabBtn, weeklyMeetingTabBtn, themeTabBtn];
    // 콘텐츠 패널 목록에 homePanel 추가
    const contentPanels = [homePanel, projectPanel, engineerPanel, businessLicensePanel, weeklyMeetingPanel, themePanel];

    function switchPanel(activePanelElement, activeTabButton = null) { // activeTabButton을 선택적으로 만듦
        // 모든 패널 숨기기
        contentPanels.forEach(panel => panel.classList.add('hidden'));
        // 모든 사이드바 버튼의 'active' 클래스 제거
        sidebarButtons.forEach(btn => btn.classList.remove('active'));

        // 선택된 패널 보이기
        activePanelElement.classList.remove('hidden');
        // 선택된 버튼에 'active' 클래스 추가 (null이 아닌 경우에만)
        if (activeTabButton) {
            activeTabButton.classList.add('active');
        }

        // 각 패널에 맞는 콘텐츠 렌더링 함수 호출
        if (activePanelElement.id === 'homePanel') { // homePanel 처리
            renderHomeContent();
        } else if (activePanelElement.id === 'projectPanel') {
            renderProjectContent();
        } else if (activePanelElement.id === 'engineerPanel') {
            renderEngineerContent();
        } else if (activePanelElement.id === 'businessLicensePanel') {
            renderBusinessLicenseContent();
        } else if (activePanelElement.id === 'weeklyMeetingPanel') {
            renderWeeklyMeetingContent();
        } else if (activePanelElement.id === 'themePanel') {
            renderThemeContent();
            // 테마 선택 버튼에 이벤트 리스너 추가 (패널 렌더링 후)
            document.getElementById('selectStarbucksThemeBtn').addEventListener('click', () => setTheme('starbucks'));
            document.getElementById('selectAppleThemeBtn').addEventListener('click', () => setTheme('apple'));
            document.getElementById('selectPascucciThemeBtn').addEventListener('click', () => setTheme('pascucci')); // 파스쿠찌 테마 버튼 추가
        }

        // 마지막 활성 패널을 localStorage에 저장 (홈 패널로 이동했을 때도 저장)
        localStorage.setItem('activePanel', activePanelElement.id);
        saveAllData(); // 현재 상태 저장 (예: 현재 선택된 ID 등)
    }

    // 테마 변경 함수
    function setTheme(themeName) {
        const themeStylesheet = document.getElementById('theme-stylesheet');
        themeStylesheet.href = `themes/${themeName}-theme.css`;
        localStorage.setItem('activeTheme', themeName);
        console.log(`Theme set to: ${themeName}`);
    }

    // **** 가장 중요한 변경점: 초기 로딩 시 무조건 'homePanel'을 기본으로 설정합니다. ****
    // localStorage의 이전 값에 관계없이 항상 홈 패널로 시작합니다.
    const initialPanel = homePanel;
    const initialButton = null; // 초기에는 어떤 사이드바 버튼도 활성화되지 않음

    // 초기 패널 활성화
    switchPanel(initialPanel, initialButton);

    // 페이지가 로드될 때마다 localStorage에 저장된 마지막 활성 패널 정보를 제거
    // 이렇게 하면 새로고침하거나 다시 접속할 때 항상 홈으로 시작하게 됩니다.
    localStorage.removeItem('activePanel');


    // 초기 로딩 시 저장된 테마 불러와 적용
    const savedTheme = localStorage.getItem('activeTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('starbucks'); // 기본 테마 설정
    }

    // PG 헤더 클릭 이벤트 리스너 추가 (홈으로 바로가기)
    if (pgHomeBtn) {
        pgHomeBtn.addEventListener('click', () => {
            switchPanel(homePanel, null); // 홈으로 이동 시 사이드바 버튼 활성화 안 함
            localStorage.removeItem('activePanel'); // 로컬 스토리지에서 마지막 활성 패널 제거하여 항상 홈으로 시작하도록
        });
    }

    // 사이드바 버튼 클릭 이벤트 리스너
    projectTabBtn.addEventListener('click', () => switchPanel(projectPanel, projectTabBtn));
    engineerTabBtn.addEventListener('click', () => switchPanel(engineerPanel, engineerTabBtn));
    businessLicenseTabBtn.addEventListener('click', () => switchPanel(businessLicensePanel, businessLicenseTabBtn));
    weeklyMeetingTabBtn.addEventListener('click', () => switchPanel(weeklyMeetingPanel, weeklyMeetingTabBtn));
    themeTabBtn.addEventListener('click', () => switchPanel(themePanel, themeTabBtn));

    // 각 패널 내부에 있는 '추가' 버튼과 같은 동적으로 생성되는 요소에 대한 이벤트는
    // 해당 컴포넌트 렌더링 함수 (예: renderEngineerContent) 내에서 처리해야 합니다.
    // 여기 main.js에서는 전역적인 이벤트만 처리합니다.
});