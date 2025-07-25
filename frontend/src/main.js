import './style.css';
import { projects } from './data.js';
import * as Components from './components.js';

function setTheme(themeName) { document.getElementById('theme-stylesheet').href = `/themes/${themeName}-theme.css`; localStorage.setItem('activeTheme', themeName); }

function updateDarkModeIcon() {
    const htmlEl = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) { darkModeToggle.innerHTML = htmlEl.classList.contains('dark') ? '🌕' : '🌙'; }
}

document.addEventListener('DOMContentLoaded', () => {
    const htmlEl = document.documentElement;
    const header = document.querySelector('header');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.content-area');

    header.innerHTML = `<div id="pgHomeBtn" class="cursor-pointer"><h1 class="text-xl font-semibold">PG</h1></div><button id="darkModeToggle" class="p-2 rounded-full text-2xl"></button>`;
    sidebar.innerHTML = `
        <button id="projectTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">프로젝트</button>
        <button id="clientsTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">관계사</button>
        <button id="engineerTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">기술인</button>
        <button id="businessLicenseTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">업면허</button>
        <button id="docsTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">문서/서식</button>
        <button id="financeTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">청구/재무</button>
        <button id="weeklyMeetingTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">주간회의</button>
        <div class="flex-grow"></div>
        <button id="themeTabBtn" class="sidebar-button w-full text-left p-2 rounded-md">테마</button>
    `;
    
    sidebar.addEventListener('click', (e) => {
        const btn = e.target.closest('.sidebar-button');
        if (!btn) return;
        sidebar.querySelectorAll('.sidebar-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const panelId = btn.id.replace('TabBtn', '');
        switch (panelId) {
            case 'project': Components.renderProjectContent(mainContent); Components.renderProjectList(projects); break;
            case 'clients': Components.renderClientsContent(mainContent); break;
            case 'engineer': Components.renderEngineerContent(mainContent); break;
            case 'businessLicense': Components.renderBusinessLicenseContent(mainContent); break;
            case 'docs': Components.renderDocsContent(mainContent); break;
            case 'finance': Components.renderFinanceContent(mainContent); break;
            case 'weeklyMeeting': Components.renderWeeklyMeetingContent(mainContent); break;
            case 'theme': Components.renderThemeContent(mainContent); break;
        }
    });

    mainContent.addEventListener('click', (e) => {
        if (e.target.id === 'selectStarbucksThemeBtn') setTheme('starbucks');
        else if (e.target.id === 'selectAppleThemeBtn') setTheme('apple');
        else if (e.target.id === 'selectPascucciThemeBtn') setTheme('pascucci');
    });

    document.getElementById('darkModeToggle').addEventListener('click', () => {
        htmlEl.classList.toggle('dark');
        localStorage.setItem('darkMode', htmlEl.classList.contains('dark') ? 'dark' : 'light');
        updateDarkModeIcon();
    });

    document.getElementById('pgHomeBtn').addEventListener('click', () => {
        sidebar.querySelectorAll('.sidebar-button').forEach(b => b.classList.remove('active'));
        Components.renderHomeContent(mainContent);
    });
    
    if (localStorage.getItem('darkMode') === 'dark') htmlEl.classList.add('dark');
    setTheme(localStorage.getItem('activeTheme') || 'starbucks');
    updateDarkModeIcon();
    document.getElementById('pgHomeBtn').click();
});
