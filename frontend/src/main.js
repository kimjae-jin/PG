import './style.css';
import { projects, updateProjects, currentProjectId } from './data.js';
import * as Components from './components.js';

const BACKEND_URL = 'http://localhost:4000';
let visibleFields = ['status', 'projectName', 'clientName', 'startDate', 'endDate'];
function saveVisibleFields() { localStorage.setItem('projectVisibleFields', JSON.stringify(visibleFields)); }
function loadVisibleFields() { const saved = localStorage.getItem('projectVisibleFields'); if (saved) { visibleFields = JSON.parse(saved); } }
async function fetchProjectsAndRender() { try { const res = await fetch(`${BACKEND_URL}/api/projects`); if (!res.ok) throw new Error('Network error'); updateProjects(await res.json()); Components.renderProjectList(projects, visibleFields); } catch (err) { console.error('Failed to fetch projects:', err); const c = document.getElementById('project-list-container'); if(c) c.innerHTML = `<p class="p-4 text-center text-red-500">데이터 로딩 실패. 백엔드 서버를 확인하세요.</p>`; } }
function setTheme(themeName) { document.getElementById('theme-stylesheet').href = `/themes/${themeName}-theme.css`; localStorage.setItem('activeTheme', themeName); }
function updateDarkModeIcon() { const htmlEl = document.documentElement; const darkModeToggle = document.getElementById('darkModeToggle'); if (darkModeToggle) { darkModeToggle.innerHTML = htmlEl.classList.contains('dark') ? '☀️' : '🌙'; } }

document.addEventListener('DOMContentLoaded', () => {
    loadVisibleFields();
    const htmlEl = document.documentElement;
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.content-area');

    header.innerHTML = `<div id="pgHomeBtn" class="cursor-pointer"><h1 class="text-xl font-semibold">PG</h1></div><button id="darkModeToggle" class="p-2 rounded-full text-2xl"></button>`;
    sidebar.innerHTML = `<button id="projectTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">프로젝트</button><button id="clientsTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">관계사</button><button id="engineerTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">기술인</button><button id="businessLicenseTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">업면허</button><button id="docsTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">문서/서식</button><button id="financeTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">청구/재무</button><button id="weeklyMeetingTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">주간회의</button><div class="flex-grow"></div><button id="themeTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">테마</button>`;
    
    sidebar.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-button');
        if (!btn) return;
        sidebar.querySelectorAll('.sidebar-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panelId = btn.id.replace('TabBtn', '');
        switch (panelId) {
            case 'project': Components.renderProjectContent(mainContent); Components.renderFieldSettings(visibleFields); fetchProjectsAndRender(); break;
            case 'clients': Components.renderClientsContent(mainContent); break;
            case 'engineer': Components.renderEngineerContent(mainContent); break;
            case 'businessLicense': Components.renderBusinessLicenseContent(mainContent); break;
            case 'docs': Components.renderDocsContent(mainContent); break;
            case 'finance': Components.renderFinanceContent(mainContent); break;
            case 'weeklyMeeting': Components.renderWeeklyMeetingContent(mainContent); break;
            case 'theme': Components.renderThemeContent(mainContent); break;
        }
    });

    mainContent.addEventListener('input', (e) => {
        const { name, value, type } = e.target;
        if (name === 'totalAmount' || name === 'totalEquityAmount') { const numValue = value.replace(/,/g, ''); e.target.value = isNaN(numValue) || numValue === '' ? '' : Number(numValue).toLocaleString('ko-KR'); }
        if (type === 'text' && value.toLowerCase() === 'yms') { const today = new Date().toISOString().split('T')[0]; e.target.type = 'date'; e.target.value = today; }
    });

    mainContent.addEventListener('click', async (e) => {
        if (e.target.id === 'field-settings-btn') { document.getElementById('field-settings-dropdown').classList.toggle('hidden'); return; }
        const checkbox = e.target.closest('#field-settings-dropdown input[type="checkbox"]');
        if (checkbox) { const field = checkbox.dataset.field; if (checkbox.checked) { if (!visibleFields.includes(field)) visibleFields.push(field); } else { visibleFields = visibleFields.filter(f => f !== field); } saveVisibleFields(); Components.renderProjectList(projects, visibleFields); return; }
        
        // ✨ (복원) 누락되었던 테마 선택 로직 ✨
        if (e.target.id.startsWith('select')) {
            if (e.target.id === 'selectStarbucksThemeBtn') setTheme('starbucks');
            else if (e.target.id === 'selectAppleThemeBtn') setTheme('apple');
            else if (e.target.id === 'selectPascucciThemeBtn') setTheme('pascucci');
            return; // 다른 버튼 로직과 충돌 방지
        }
        
        if (e.target.id === 'addProjectBtn') { Components.renderProjectForm(mainContent); }
        if (e.target.id === 'cancel-btn') { document.getElementById('projectTabBtn').click(); }
        if (e.target.id === 'save-project-btn') {
            e.preventDefault();
            const form = document.getElementById('project-form');
            const projectData = { projectName: form.elements.projectName.value, projectCategory: form.elements.projectCategory.value, pmName: form.elements.pmName.value, projectLocation: form.elements.projectLocation.value, summary: form.elements.summary.value, clientName: form.elements.clientName.value };
            const contractData = { contractId: form.elements.contractId.value, contractType: form.elements.contractType.value, contractDate: form.elements.contractDate.value, startDate: form.elements.startDate.value, endDate: form.elements.endDate.value, totalAmount: form.elements.totalAmount.value.replace(/,/g, ''), totalEquityAmount: form.elements.totalEquityAmount.value.replace(/,/g, '') };
            try {
                const res = await fetch(`${BACKEND_URL}/api/projects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project: projectData, contract: contractData }) });
                if (!res.ok) { const errData = await res.json(); throw new Error(errData.message); }
                alert('프로젝트가 성공적으로 등록되었습니다.');
                document.getElementById('projectTabBtn').click();
            } catch (err) { alert(`등록 실패: ${err.message}`); }
        }
    });

    document.getElementById('darkModeToggle').addEventListener('click', () => { htmlEl.classList.toggle('dark'); localStorage.setItem('darkMode', htmlEl.classList.contains('dark') ? 'dark' : 'light'); updateDarkModeIcon(); });
    document.getElementById('pgHomeBtn').addEventListener('click', () => { sidebar.querySelectorAll('.sidebar-button').forEach(b => b.classList.remove('active')); Components.renderHomeContent(mainContent); });
    
    if (localStorage.getItem('darkMode') === 'dark') htmlEl.classList.add('dark');
    setTheme(localStorage.getItem('activeTheme') || 'starbucks');
    updateDarkModeIcon();
    document.getElementById('pgHomeBtn').click();
});
