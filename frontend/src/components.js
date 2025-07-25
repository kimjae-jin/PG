// (renderHomeContent 등 다른 함수들은 이전과 동일하게 유지)
export function renderHomeContent(container) { container.innerHTML = `<div class="p-4 h-full flex flex-col justify-center items-center text-center"><h1 class="text-4xl font-bold mb-4" style="color: var(--header-text)">Project 'Aircraft Carrier'</h1><p class="text-lg" style="color: var(--header-text)">좌측 메뉴를 선택하여 항해를 시작하십시오.</p></div>`; }
export function renderClientsContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">관계사</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderEngineerContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">기술인</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderBusinessLicenseContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">업면허</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderWeeklyMeetingContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">주간회의</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderDocsContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">문서/서식</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderFinanceContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">청구/재무</h3><p class="mt-4 text-gray-500 dark:text-gray-400">준비중인 기능입니다.</p></div>`; }
export function renderThemeContent(container) { container.innerHTML = `<div class="p-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">테마 선택</h3><div class="flex flex-col space-y-4"><button id="selectStarbucksThemeBtn" class="btn-primary">스타벅스</button><button id="selectAppleThemeBtn" class="btn-primary">애플</button><button id="selectPascucciThemeBtn" class="btn-primary">파스쿠찌</button></div></div>`; }
export function renderProjectContent(container) { container.innerHTML = `<div class="p-4 h-full flex flex-col"><div class="flex justify-between items-center mb-4"><h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200">프로젝트 목록</h3><div class="relative flex items-center"><button id="field-settings-btn" class="btn-secondary mr-2">필드 설정</button><div id="field-settings-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-10 p-2 space-y-1 top-full"></div><button id="addProjectBtn" class="btn-primary">+ 신규 등록</button></div></div><div id="project-list-container" class="flex-grow overflow-auto"></div></div>`;}
export function renderProjectList(projects, visibleFields) { /* 이전과 동일 */ }
export function renderFieldSettings(visibleFields) { /* 이전과 동일 */ }

// 신규 프로젝트 등록 폼 (진짜 표준 설계도 완벽 복제 버전)
export function renderProjectForm(container) {
    container.innerHTML = `
        <div class="h-full flex flex-col p-4">
            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex-shrink-0">신규 프로젝트 등록</h3>
            <form id="project-form" class="flex-grow overflow-auto space-y-6 pr-2">
                
                <div class="space-y-2">
                    <label class="form-label">기본 정보</label>
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                        <div><label class="form-label text-xs">계약구분</label><div class="flex items-center space-x-4 pt-2"><label><input type="radio" name="contractType" value="P" class="mr-1" checked> 일반</label><label><input type="radio" name="contractType" value="S" class="mr-1"> 하도급</label></div></div>
                        <div><label class="form-label text-xs">구분</label><select name="projectCategory" class="form-select"><option>공공</option><option>민간</option><option>PQ</option><option>공공(하)</option></select></div>
                        <div><label class="form-label text-xs">프로젝트넘버</label><input name="projectNumber" class="form-input" placeholder="자동생성 (yyyy-###)"></div>
                        <div><label class="form-label text-xs">계약번호</label><input name="contractId" class="form-input"></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="form-label">계약 상세</label>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                        <div class="md:col-span-2"><label class="form-label text-xs">계약명 *</label><input name="projectName" class="form-input" required></div>
                        <div><label class="form-label text-xs">계약자</label><input name="clientName" class="form-input"></div>
                        <div><label class="form-label text-xs">총 계약금액</label><input type="text" inputmode="numeric" name="totalAmount" class="form-input text-right"></div>
                        <div><label class="form-label text-xs">총 지분금액</label><input type="text" inputmode="numeric" name="totalEquityAmount" class="form-input text-right"></div>
                        <div><label class="form-label text-xs">지분율 (%)</label><input type="number" name="equityRatio" class="form-input text-right" readonly></div>
                        <div class="flex items-end pb-2"><label class="flex items-center"><input type="checkbox" name="vatApplied" class="mr-2 h-4 w-4 rounded"> 부가세 적용</label></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="form-label">일정 관리</label>
                     <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                        <div><label class="form-label text-xs">계약일</label><input type="text" name="contractDate" class="form-input" placeholder="yms"></div>
                        <div><label class="form-label text-xs">시작일</label><input type="text" name="startDate" class="form-input" placeholder="yms"></div>
                        <div><label class="form-label text-xs">완료예정일</label><input type="text" name="endDate" class="form-input" placeholder="yms"></div>
                        <div><label class="form-label text-xs">완료일</label><input type="date" name="completionDate" class="form-input"></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="form-label">과업 개요</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                        <div><label class="form-label text-xs">위치</label><input name="projectLocation" class="form-input"></div>
                        <div><label class="form-label text-xs">개요 (70자 이내)</label><input name="summary" class="form-input" maxlength="70"></div>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="form-label">기타 사항</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                         <div><label class="form-label text-xs">특이사항 (자동 기록)</label><textarea name="specialNotes" class="form-textarea h-24" readonly></textarea></div>
                         <div><label class="form-label text-xs">비고</label><textarea name="remarks" class="form-textarea h-24"></textarea></div>
                    </div>
                </div>

                 <div class="space-y-2">
                    <label class="form-label">담당자 정보</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg" style="border-color: var(--form-element-border);">
                         <div><label class="form-label text-xs">PM (사내 확인용)</label><input name="pmName" class="form-input" placeholder="재직자 중 선택 (구현예정)"></div>
                         <div><label class="form-label text-xs">참여기술인</label><div class="p-3 mt-1 border rounded-md bg-gray-200 dark:bg-gray-700 text-gray-500">다음 단계에서 구현됩니다.</div></div>
                    </div>
                </div>

                <footer class="flex justify-end gap-2 pt-4 flex-shrink-0">
                    <button type="button" id="cancel-btn" class="btn-secondary">취소</button>
                    <button type="submit" id="save-project-btn" class="btn-primary">저장</button>
                </footer>
            </form>
        </div>
    `;
}
