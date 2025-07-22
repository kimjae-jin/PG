// main.js
import { engineers, projects, businessLicenses, weeklyMeetings,
         currentEngineerId, currentProjectId, currentBusinessLicenseId, currentWeeklyMeetingId,
         updateEngineers, updateProjects, updateBusinessLicenses, updateWeeklyMeetings,
         updateCurrentEngineerId, updateCurrentProjectId, updateCurrentBusinessLicenseId, updateCurrentWeeklyMeetingId } from './data.js';
import { saveAllData, loadAllData } from './storage.js';
import { renderEngineerContent, renderProjectContent, renderBusinessLicenseContent, renderWeeklyMeetingContent, updateComponentData } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. 데이터 로드 (가장 먼저 수행)
    loadAllData();
    // 로드된 데이터를 components.js의 내부 상태로 업데이트
    updateComponentData(engineers, projects, businessLicenses, weeklyMeetings, currentEngineerId.id, currentProjectId.id, currentBusinessLicenseId.id, currentWeeklyMeetingId.id);


    // 2. 다크 모드 토글 기능
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement; // <html> 태그

    // 저장된 테마 설정 불러오기 및 초기 적용
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
    } else {
        htmlElement.classList.remove('dark');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            htmlElement.classList.toggle('dark');
            if (htmlElement.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // 3. 사이드바 메뉴 전환 로직
    const projectTabBtn = document.getElementById('projectTabBtn');
    const engineerTabBtn = document.getElementById('engineerTabBtn');
    const businessLicenseTabBtn = document.getElementById('businessLicenseTabBtn');
    const weeklyMeetingTabBtn = document.getElementById('weeklyMeetingTabBtn');

    const projectPanel = document.getElementById('projectPanel');
    const engineerPanel = document.getElementById('engineerPanel');
    const businessLicensePanel = document.getElementById('businessLicensePanel');
    const weeklyMeetingPanel = document.getElementById('weeklyMeetingPanel');

    const sidebarButtons = [projectTabBtn, engineerTabBtn, businessLicenseTabBtn, weeklyMeetingTabBtn];
    const contentPanels = [projectPanel, engineerPanel, businessLicensePanel, weeklyMeetingPanel];

    function switchPanel(activePanelElement, activeTabButton) {
        // 모든 패널 숨기기
        contentPanels.forEach(panel => panel.classList.add('hidden'));
        // 모든 사이드바 버튼의 'active' 클래스 제거
        sidebarButtons.forEach(btn => btn.classList.remove('active'));

        // 선택된 패널 보이기
        activePanelElement.classList.remove('hidden');
        // 선택된 버튼에 'active' 클래스 추가
        activeTabButton.classList.add('active');

        // 각 패널에 맞는 콘텐츠 렌더링 함수 호출
        if (activePanelElement.id === 'projectPanel') {
            renderProjectContent();
        } else if (activePanelElement.id === 'engineerPanel') {
            renderEngineerContent();
        } else if (activePanelElement.id === 'businessLicensePanel') {
            renderBusinessLicenseContent();
        } else if (activePanelElement.id === 'weeklyMeetingPanel') {
            renderWeeklyMeetingContent();
        }

        // 마지막 활성 패널을 localStorage에 저장
        localStorage.setItem('activePanel', activePanelElement.id);
        saveAllData(); // 현재 상태 저장 (예: 현재 선택된 ID 등)
    }

    // 초기 로딩 시 마지막 활성 패널을 불러오거나 'engineerPanel'을 기본으로 설정
    const lastActivePanelId = localStorage.getItem('activePanel');
    let initialPanel = engineerPanel; // 기본값은 기술인 패널
    let initialButton = engineerTabBtn;

    // 만약 저장된 패널이 유효하면 해당 패널로 설정
    if (lastActivePanelId === 'projectPanel' && projectPanel) {
        initialPanel = projectPanel;
        initialButton = projectTabBtn;
    } else if (lastActivePanelId === 'businessLicensePanel' && businessLicensePanel) {
        initialPanel = businessLicensePanel;
        initialButton = businessLicenseTabBtn;
    } else if (lastActivePanelId === 'weeklyMeetingPanel' && weeklyMeetingPanel) {
        initialPanel = weeklyMeetingPanel;
        initialButton = weeklyMeetingTabBtn;
    }
    // 초기 패널 활성화
    switchPanel(initialPanel, initialButton);


    // 사이드바 버튼 클릭 이벤트 리스너
    projectTabBtn.addEventListener('click', () => switchPanel(projectPanel, projectTabBtn));
    engineerTabBtn.addEventListener('click', () => switchPanel(engineerPanel, engineerTabBtn));
    businessLicenseTabBtn.addEventListener('click', () => switchPanel(businessLicensePanel, businessLicenseTabBtn));
    weeklyMeetingTabBtn.addEventListener('click', () => switchPanel(weeklyMeetingPanel, weeklyMeetingTabBtn));

    // 각 패널 내부에 있는 '추가' 버튼과 같은 동적으로 생성되는 요소에 대한 이벤트는
    // 해당 컴포넌트 렌더링 함수 (예: renderEngineerContent) 내에서 처리해야 합니다.
    // 여기 main.js에서는 전역적인 이벤트만 처리합니다.
});
