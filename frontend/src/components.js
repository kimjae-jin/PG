// (이전에 정의한 모든 render 함수들은 그대로 유지됩니다)
export function renderHomeContent(container) { container.innerHTML = `<div class="p-4 h-full flex flex-col justify-center items-center text-center"><h1 class="text-4xl font-bold mb-4" style="color: var(--header-text)">Project 'Aircraft Carrier'</h1><p class="text-lg" style="color: var(--header-text)">좌측 메뉴를 선택하여 항해를 시작하십시오.</p></div>`; }
export function renderClientsContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">관계사</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderEngineerContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">기술인</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderBusinessLicenseContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">업면허</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderWeeklyMeetingContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">주간회의</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderDocsContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">문서/서식</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderFinanceContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">청구/재무</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderThemeContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">테마 선택</h3><div class="flex flex-col space-y-4"><button id="selectStarbucksThemeBtn" class="btn-primary">스타벅스</button><button id="selectAppleThemeBtn" class="btn-primary">애플</button><button id="selectPascucciThemeBtn" class="btn-primary">파스쿠찌</button></div></div>`; }
export function renderProjectContent(container) { container.innerHTML = `<div class="p-4 h-full flex flex-col"><div class="flex justify-between items-center mb-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">프로젝트 목록</h3><div class="relative flex items-center"><button id="field-settings-btn" class="btn-secondary mr-2">필드 설정</button><div id="field-settings-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 p-2 space-y-1 top-full"></div><button id="addProjectBtn" class="btn-primary">+ 신규 등록</button></div></div><div id="project-list-container" class="flex-grow overflow-auto"></div></div>`;}
export function renderFieldSettings(visibleFields) { /* 이전과 동일 */ }
export function renderProjectForm(container) { /* 이전과 동일 */ }

// 프로젝트 목록 렌더링 함수만 최종 수정
export function renderProjectList(projects, visibleFields) {
    const container = document.getElementById('project-list-container');
    if (!container) return;
    const allFields = { status: { name: '상태' }, projectCategory: { name: '구분' }, projectName: { name: '계약명', truncate: true }, clientName: { name: '계약자' }, pmName: { name: 'PM' }, startDate: { name: '시작일', type: 'date' }, endDate: { name: '종료 예정일', type: 'date' }, totalEquityAmount: { name: '총 지분금액', type: 'currency' } };
    let content = '';
    if (!projects || projects.length === 0) { content = `<p class="p-4 text-center text-gray-500 dark:text-gray-400">등록된 프로젝트가 없습니다.</p>`; } else {
        content = `<table class="w-full text-left table-fixed"><thead class="sticky top-0 bg-gray-100 dark:bg-gray-900"><tr class="border-b dark:border-gray-700">${Object.keys(allFields).map(key => visibleFields.includes(key) ? `<th class="p-2 font-semibold" data-field="${key}">${allFields[key].name}</th>` : '').join('')}</tr></thead><tbody>${projects.map(p => `<tr class="border-b dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" data-id="${p.projectId}">${Object.keys(allFields).map(key => { if (!visibleFields.includes(key)) return ''; let value = p[key] || ''; if (allFields[key].type === 'date' && value) value = new Date(value).toLocaleDateString(); if (allFields[key].type === 'currency' && value) value = Number(value).toLocaleString() + ' 원'; const truncateClass = allFields[key].truncate ? 'table-cell-truncate' : ''; return `<td class="p-2 ${truncateClass}" title="${p[key] || ''}">${value}</td>`; }).join('')}</tr>`).join('')}</tbody></table>`;
    }
    container.innerHTML = content;
}
