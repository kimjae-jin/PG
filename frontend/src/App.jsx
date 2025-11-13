import React, { useState, useEffect } from 'react';
// index.css는 main.jsx에서 임포트되므로 여기서는 필요 없습니다.

// --- 1. 메인 App 컴포넌트 ---
export default function App() {
  const [theme, setTheme] = useState('dark'); // 다크/라이트 모드 상태
  const [currentView, setCurrentView] = useState('dashboard'); // 현재 보이는 뷰(페이지)
  const [selectedTechId, setSelectedTechId] = useState(null); // 선택된 기술인 ID
  const [selectedProjectId, setSelectedProjectId] = useState(null); // 선택된 프로젝트 ID
  const [selectedLicenseId, setSelectedLicenseId] = useState(null); // 선택된 면허 ID
  const [selectedPqPreId, setSelectedPqPreId] = useState(null); // PQ 발주예정 ID
  const [selectedPqId, setSelectedPqId] = useState(null); // PQ ID

  // --- 모달 상태 ---
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isTechCareerModalOpen, setIsTechCareerModalOpen] = useState(false);

  // 테마 적용
  useEffect(() => {
    // 저장된 테마 로드
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    // 테마 변경 시 HTML 클래스 토글
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#000000'; // 제트블랙
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f1f1f1'; // 라이트그레이
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // 뷰(페이지) 네비게이션 함수
  const navigateTo = (view, id = null) => {
    setCurrentView(view);
    
    // 뷰 유형에 따라 ID 설정
    if (view === 'tech-detail') setSelectedTechId(id);
    if (view === 'project-detail') setSelectedProjectId(id);
    if (view === 'license-detail') setSelectedLicenseId(id);
    if (view === 'pq-pre-detail') setSelectedPqPreId(id);
    if (view === 'pq-detail') setSelectedPqId(id);
  };
  
  // 현재 뷰에 따라 적절한 컴포넌트 렌더링
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView navigateTo={navigateTo} />;
      case 'tech':
        return <TechnicianListView navigateTo={navigateTo} />;
      case 'tech-detail':
        return <TechnicianDetailView techId={selectedTechId} navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} openTechCareerModal={() => setIsTechCareerModalOpen(true)} />;
      case 'project':
        return <ProjectListView navigateTo={navigateTo} />;
      case 'project-detail':
        return <ProjectDetailView projectId={selectedProjectId} navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'license':
          return <LicenseListView navigateTo={navigateTo} />;
      case 'license-detail':
          return <LicenseDetailView licenseId={selectedLicenseId} navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'client':
          return <ClientListView navigateTo={navigateTo} />;
      case 'pq':
        return <PQListView navigateTo={navigateTo} />;
      case 'pq-pre-detail':
          return <PQPreDetailView pqPreId={selectedPqPreId} navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'pq-detail':
          return <PQDetailView pqId={selectedPqId} navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'doc':
          return <DocumentView navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'estimate':
          return <EstimateView navigateTo={navigateTo} openFileModal={() => setIsFileManagerOpen(true)} />;
      case 'weekly':
          return <WeeklyView navigateTo={navigateTo} />;
      default:
        return <DashboardView navigateTo={navigateTo} />;
    }
  };

  // React에서는 <style> 대신 index.css와 Tailwind config를 사용합니다.
  // hr.html의 스타일은 이미 index.css와 tailwind.config.js로 분리되었습니다.

  return (
    <div className={`antialiased text-sm dark:bg-black bg-[#f1f1f1] text-black dark:text-gray-300 min-h-screen`}>
      {/* 1.1 메인 헤더 (Global Navigation) */}
      <Header 
        currentTheme={theme} 
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        navigateTo={navigateTo}
      />
      
      {/* 메인 컨텐츠 영역 */}
      <main className="container mx-auto p-4">
        {renderView()}
      </main>
      
      {/* 전역 모달 */}
      <FileManagerModal 
        isOpen={isFileManagerOpen} 
        onClose={() => setIsFileManagerOpen(false)} 
      />
      <TechCareerModal 
        isOpen={isTechCareerModalOpen} 
        onClose={() => setIsTechCareerModalOpen(false)}
      />
    </div>
  );
}

// --- 2. 헤더 컴포넌트 ---
function Header({ currentTheme, toggleTheme, navigateTo }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'tech', label: '기술인', target: 'tech' },
    { key: 'license', label: '면허', target: 'license' },
    { key: 'project', label: '프로젝트', target: 'project' },
    { key: 'client', label: '거래처', target: 'client' },
    { key: 'pq', label: 'PQ (수주)', target: 'pq' },
    { key: 'doc', label: '문서', target: 'doc' },
    { key: 'estimate', label: '견적', target: 'estimate' },
    { key: 'weekly', label: '주간회의', target: 'weekly' },
  ];

  const handleNavClick = (target) => {
    navigateTo(target);
    setIsMobileMenuOpen(false); // 모바일 메뉴 닫기
  };

  return (
    <header className="card sticky top-0 z-40 w-full shadow-md border-b bg-white dark:bg-[#1c1c1e] dark:border-[#3a3a3c]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* 로고/홈 */}
          <a href="#" onClick={(e) => {e.preventDefault(); handleNavClick('dashboard')}} className="nav-link text-xl font-bold text-black dark:text-white" style={{ fontFamily: "'견고딕', 'Noto Sans KR', sans-serif" }}>
            HR
          </a>

          {/* 중앙 카테고리 (데스크탑) */}
          <nav className="hidden md:flex flex-grow justify-center space-x-4">
            {navItems.map(item => (
              <a 
                key={item.key} 
                href="#" 
                onClick={(e) => {e.preventDefault(); handleNavClick(item.target)}} 
                className="nav-link px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* 우측 유틸리티 */}
          <div className="flex items-center space-x-4">
            <button className="hidden md:inline-flex items-center btn btn-outline">
              <SheetsIcon />
              Sheets로 내보내기
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              <MenuIcon />
            </button>
          </div>
        </div>
      </div>
      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden card border-t bg-white dark:bg-[#1c1c1e] dark:border-[#3a3a3c]">
          {navItems.map(item => (
            <a 
              key={item.key} 
              href="#" 
              onClick={(e) => {e.preventDefault(); handleNavClick(item.target)}} 
              className="nav-link block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// --- 3. 대시보드 뷰 ---
function DashboardView() {
  // 이 뷰에서도 백엔드에서 요약 데이터를 fetch 해올 수 있습니다.
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">현황판</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 카드 예시 */}
        <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">총 기술인</h2>
          <p className="text-3xl font-bold text-black dark:text-white">120 명</p>
        </div>
        <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">진행중 프로젝트</h2>
          <p className="text-3xl font-bold text-black dark:text-white">35 건</p>
        </div>
        <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">PQ (수주) 현황</h2>
          <p className="text-3xl font-bold text-black dark:text-white">발주예정 5 건</p>
        </div>
        <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">면허 현황</h2>
          <p className="text-3xl font-bold text-red-500">1 개 (미달)</p>
        </div>
      </div>
    </section>
  );
}

// --- 4. 기술인 목록 뷰 ---
function TechnicianListView({ navigateTo }) {
  const [techs, setTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'card'
  const [filters, setFilters] = useState({ status: '', grade: '' });

  // 컴포넌트 마운트 시 백엔드에서 데이터 가져오기
  useEffect(() => {
    setLoading(true);
    // 백엔드 API 호출 (포트는 3001)
    fetch('http://localhost:3001/api/technicians')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setTechs(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("백엔드 통신 오류:", error);
        // 목업 데이터로 폴백 (백엔드 서버가 꺼져있을 경우)
        setTechs([
            { id: 1, name: '홍길동', role: '특급', status: '재직' },
            { id: 2, name: '김철수', role: '고급', status: '재직' },
            { id: 3, name: '이영희', role: '중급', status: '퇴사' },
        ]);
        setLoading(false);
      });
  }, []); // 빈 배열: 컴포넌트 마운트 시 1회 실행
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // TODO: 실제 필터링 로직 (백엔드에서 처리하는 것이 더 효율적)
  const filteredTechs = techs.filter(tech => {
      return (filters.status ? tech.status === filters.status : true) &&
             (filters.grade ? tech.role === filters.grade : true);
  });

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">기술인 관리</h1>
      <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
        {/* 상단 컨트롤 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <input type="text" placeholder="기술인 검색..." className="form-input dark:bg-[#374151] dark:border-[#4b5563]" />
            <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select dark:bg-[#374151] dark:border-[#4b5563] w-full md:w-32">
              <option value="">상태 (전체)</option>
              <option value="재직">재직</option>
              <option value="퇴사">퇴사</option>
            </select>
            <select name="grade" value={filters.grade} onChange={handleFilterChange} className="form-select dark:bg-[#374151] dark:border-[#4b5563] w-full md:w-32">
                <option value="">등급 (전체)</option>
                <option value="특급">특급</option>
                <option value="고급">고급</option>
                <option value="중급">중급</option>
                <option value="초급">초급</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
                <button onClick={() => setViewMode('list')} className={`btn btn-outline ${viewMode === 'list' ? 'active' : ''}`}>목록</button>
                <button onClick={() => setViewMode('card')} className={`btn btn-outline ${viewMode === 'card' ? 'active' : ''}`}>카드</button>
            </div>
            <button className="btn btn-success">엑셀 불러오기</button>
            <button className="btn btn-primary">엑셀 내보내기</button>
          </div>
        </div>

        {/* 로딩 표시 */}
        {loading && <p className="text-center dark:text-gray-300">데이터 로딩 중...</p>}

        {/* 목록 뷰 */}
        {!loading && viewMode === 'list' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>등급</th>
                  <th>상태 (인라인 편집)</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredTechs.map(tech => (
                  <tr key={tech.id}>
                    <td>{tech.name}</td>
                    <td>{tech.role}</td>
                    <td>
                      <select className="inline-select dark:bg-[#374151]" defaultValue={tech.status}>
                        <option value="재직">재직</option>
                        <option value="퇴사">퇴사</option>
                      </select>
                    </td>
                    <td className="flex space-x-1">
                      <button className="btn btn-primary btn-icon text-xs" title="저장"><SaveIcon /></button>
                      <button 
                        onClick={() => navigateTo('tech-detail', tech.id)} 
                        className="btn btn-outline text-xs px-3 py-1"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 카드 뷰 */}
        {!loading && viewMode === 'card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTechs.map(tech => (
                    <div key={tech.id} className="card border dark:border-[#3a3a3c] rounded-lg shadow p-4 flex flex-col items-center">
                         <img src={`https://placehold.co/100x100/e2e8f0/64748b?text=${tech.name.substring(0,1)}`} alt="프로필 사진" className="w-24 h-24 rounded-full mb-3 object-cover" />
                         <h3 className="text-lg font-bold text-black dark:text-white">{tech.name}</h3>
                         <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{tech.role}</p>
                         <span className={`px-2 py-1 ${tech.status === '재직' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'} rounded-full text-xs mt-2`}>{tech.status}</span>
                         <button onClick={() => navigateTo('tech-detail', tech.id)} className="btn btn-primary text-xs px-3 py-1 mt-3 w-full">상세 보기</button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </section>
  );
}

// --- 5. 기술인 상세 뷰 ---
function TechnicianDetailView({ techId, navigateTo, openFileModal, openTechCareerModal }) {
  const [tech, setTech] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tech-tab-1'); // 현재 활성 탭
  const [activeSubView, setActiveSubView] = useState('list'); // 실적 탭 내부 뷰

  // techId가 변경될 때마다 백엔드에서 상세 데이터 가져오기
  useEffect(() => {
    if (!techId) return; // ID가 없으면 중단
    
    setLoading(true);
    // 백엔드 API 호출 (동적 ID)
    fetch(`http://localhost:3001/api/technicians/${techId}`)
      .then(res => res.json())
      .then(data => {
        setTech(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("백엔드 통신 오류:", error);
        // 목업 데이터로 폴백
        setTech({
            id: techId,
            name: '홍길동 (목업)',
            role: '특급',
            status: '재직',
            management: { field: '토목', grade: '특급' },
            licenses: [
                { name: '토목시공기술사', date: '2010-03-01', number: '10-12345' },
            ]
        });
        setLoading(false);
      });
  }, [techId]);

  if (loading) return <p className="text-center dark:text-gray-300">상세 정보 로딩 중...</p>;
  if (!tech) return <p className="text-center text-red-500">데이터를 불러오지 못했습니다.</p>;
  
  const TABS = [
    { id: 'tech-tab-1', label: '1. 관리번호' },
    { id: 'tech-tab-2', label: '2. 기술자격' },
    { id: 'tech-tab-3', label: '3. 학력' },
    { id: 'tech-tab-4', label: '4. 교육훈련' },
    { id: 'tech-tab-5', label: '5. 상훈' },
    { id: 'tech-tab-6', label: '6. 벌점' },
    { id: 'tech-tab-7', label: '7. 근무이력' },
    { id: 'tech-tab-8', label: '8. 기술경력' },
    { id: 'tech-tab-9', label: '9. 실적' },
    { id: 'tech-tab-10', label: '10. 업무중첩' },
    { id: 'tech-tab-11', label: '11. 면허관련' },
    { id: 'tech-tab-12', label: '12. 특이사항' },
    { id: 'tech-tab-13', label: '13. 개인 대시보드' },
  ];
  
  const renderTabContent = () => {
      switch(activeTab) {
          case 'tech-tab-1':
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card border dark:border-[#3a3a3c] p-4 rounded">
                      <h3 className="font-semibold mb-2">설계/시공 등</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <label className="font-medium">직무분야</label><span>{tech.management.field}</span>
                        <label className="font-medium">등급</label><span>{tech.management.grade}</span>
                        <label className="font-medium">전문분야</label><span>도로및공항</span>
                        <label className="font-medium">등급</label><span>특급</span>
                      </div>
                    </div>
                    {/* ... 다른 관리번호 카드 ... */}
                  </div>
                </div>
              );
          case 'tech-tab-2':
              return (
                  <div>
                    <button className="btn btn-primary mb-4">신규 등록</button>
                    <div className="overflow-x-auto">
                      <table className="data-table">
                        <thead>
                          <tr><th>종목 및 등급</th><th>합격일</th><th>등록번호</th><th>파일</th><th>관리</th></tr>
                        </thead>
                        <tbody>
                          {tech.licenses.map((lic, index) => (
                            <tr key={index}>
                              <td>{lic.name}</td>
                              <td>{lic.date}</td>
                              <td>{lic.number || '05-12345'}</td>
                              <td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td>
                              <td><button className="btn btn-secondary text-xs px-2 py-1">수정</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
              );
          case 'tech-tab-7':
              return <TechTabWorkHistory openFileModal={openFileModal} />;
          case 'tech-tab-8':
              return <TechTabCareer openFileModal={openFileModal} openTechCareerModal={openTechCareerModal} />;
          case 'tech-tab-9':
              return (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                        <button className="btn btn-primary">신규 등록</button>
                        <div>
                            <button onClick={() => setActiveSubView('card')} className={`btn btn-outline ${activeSubView === 'card' ? 'active' : ''}`}>카드</button>
                            <button onClick={() => setActiveSubView('list')} className={`btn btn-outline ${activeSubView === 'list' ? 'active' : ''}`}>목록</button>
                        </div>
                    </div>
                    {/* 실적 목록/카드 뷰 ... */}
                  </div>
              );
          case 'tech-tab-13':
              return <TechTabDashboard />;
          default:
              return <p className="dark:text-gray-400">선택된 탭: {activeTab}</p>;
      }
  };

  return (
    <div className="detail-page-layout">
      {/* 상단 기본 정보 (고정) */}
      <div className="detail-page-header card border-b dark:border-[#3a3a3c] p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:opacity-80">
                <ProfileIcon />
            </div>
            <h1 className="text-2xl font-bold text-black dark:text-white">{tech.name}</h1>
          </div>
          <div className="flex space-x-2">
             <button className="btn btn-success">경력확인서 출력</button>
             <button onClick={() => navigateTo('tech')} className="btn btn-outline">
                &larr; 목록으로
             </button>
          </div>
        </div>
        {/* ... (홍길동의 기본 정보 그리드) ... */}
      </div>

      {/* 하단 탭 (스크롤) */}
      <div className="detail-page-content card mt-4">
        {/* 탭 네비게이션 */}
        <div className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
          <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
            {TABS.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-4">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

// --- 5.1 기술인 상세 탭 (컴포넌트 분리 예시) ---
function TechTabWorkHistory({ openFileModal }) {
  const handleUpload = () => {
    // 1. 파일 선택
    // 2. new FormData()
    // 3. fetch('http://localhost:3001/api/technicians/upload-work-history', { method: 'POST', body: formData })
    alert('백엔드의 엑셀 업로드 API를 호출합니다.');
  };
  return (
    <div>
        <div className="flex space-x-2 mb-4 flex-wrap gap-2">
           <button className="btn btn-primary">신규 등록</button>
           <button className="btn btn-outline">엑셀 양식 다운로드</button>
           <button onClick={handleUpload} className="btn btn-success">엑셀 일괄 업로드</button>
        </div>
        <div className="overflow-x-auto">
            <table className="data-table">
                <thead><tr><th>시작일</th><th>종료일</th><th>기간</th><th>상호</th><th>파일</th><th>관리</th></tr></thead>
                <tbody>
                    <tr>
                        <td>2005-03-01</td>
                        <td>2010-02-28</td>
                        <td>5년 0개월</td>
                        <td>(주)AA엔지니어링</td>
                        <td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td>
                        <td><button className="btn btn-secondary text-xs px-2 py-1">수정</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  );
}

function TechTabCareer({ openFileModal, openTechCareerModal }) {
    const handleUpload = () => {
        alert('백엔드의 기술경력 엑셀 업로드 API를 호출합니다.');
    };
    return (
     <div>
        <div className="flex space-x-2 mb-4 flex-wrap gap-2">
            <button onClick={openTechCareerModal} className="btn btn-primary">신규 등록 (선택상자)</button>
            <button className="btn btn-outline">엑셀 양식 다운로드</button>
            <button onClick={handleUpload} className="btn btn-success">엑셀 일괄 업로드</button>
            <button className="btn btn-outline">협회 서식 자동 생성</button>
        </div>
        <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                    <th>참여기간</th>
                    <th>참여일</th>
                    <th>인정일수(N/1)</th>
                    <th>사업명</th>
                    <th>발주자</th>
                    <th>직무</th>
                    <th>전문</th>
                    <th>책임</th>
                    <th>담당</th>
                    <th>파일</th>
                    <th>관리</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td>2022-01-01 ~ 2023-12-31</td>
                    <td>730</td>
                    <td>365</td>
                    <td>OO대교 기본설계 (백엔드에서 계산된 값)</td>
                    <td>한국도로공사</td>
                    <td>토목</td>
                    <td>도로</td>
                    <td>사업책임</td>
                    <td>설계</td>
                    <td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(2)</button></td>
                    <td><button className="btn btn-secondary text-xs px-2 py-1">수정</button></td>
                </tr>
              </tbody>
            </table>
        </div>
    </div>
  );
}

function TechTabDashboard() {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">등급 산정 및 교육 현황</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">설계VE</h4>
                    <p className="text-sm">필요: <span className="font-bold">70 시간</span> / 현재: <span className="font-bold">35 시간</span></p>
                    <p className="text-sm text-red-500">부족: <span className="font-bold">35 시간</span></p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{width: '50%'}}></div>
                    </div>
                </div>
                {/* ... 다른 교육 카드 ... */}
            </div>
        </div>
    );
}


// --- 6. 프로젝트 목록 뷰 (기술인과 유사한 패턴) ---
function ProjectListView({ navigateTo }) {
  // useEffect로 '/api/projects' 호출...
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">프로젝트 관리</h1>
      <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                <input type="text" placeholder="프로젝트 검색..." className="form-input w-full md:w-48" />
                <select className="form-select w-full md:w-32">
                    <option value="">상태 (전체)</option>
                    <option value="active">진행중</option>
                    <option value="stop">중지중</option>
                    <option value="hold">보류중</option>
                    <option value="done">완료</option>
                </select>
            </div>
            <div className="flex space-x-2">
                <button className="btn btn-success">엑셀 불러오기</button>
                <button className="btn btn-primary">엑셀 내보내기</button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="data-table">
                <thead><tr><th>프로젝트 넘버</th><th>계약명</th><th>과업상태</th><th>PM</th><th>관리</th></tr></thead>
                <tbody>
                    <tr>
                        <td>P2025-001</td>
                        <td>OO대교 기본설계</td>
                        <td><span className="font-bold">진행중</span></td>
                        <td>홍길동</td>
                        <td><button onClick={() => navigateTo('project-detail', 1)} className="btn btn-primary text-xs px-3 py-1">상세</button></td>
                    </tr>
                    <tr>
                        <td>P2024-005</td>
                        <td>AA터널 안전진단</td>
                        <td><span className="font-bold text-red-500 italic">중지중</span></td>
                        <td>김철수</td>
                        <td><button onClick={() => navigateTo('project-detail', 2)} className="btn btn-primary text-xs px-3 py-1">상세</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>
    </section>
  );
}

// --- 7. 프로젝트 상세 뷰 ---
function ProjectDetailView({ projectId, navigateTo, openFileModal }) {
  const [activeTab, setActiveTab] = useState('project-tab-1');
  // useEffect로 `/api/projects/${projectId}` 호출...
  
  const TABS = [
    { id: 'project-tab-1', label: '1. 기본 계약' },
    { id: 'project-tab-2', label: '2. 변경 및 차수 계약' },
    { id: 'project-tab-3', label: '3. 재무관리' },
    { id: 'project-tab-4', label: '4. 참여 인력' },
    { id: 'project-tab-5', label: '5. 거래 관계자' },
    { id: 'project-tab-6', label: '6. 적용 면허' },
  ];
  
  const renderTabContent = () => {
      switch(activeTab) {
          case 'project-tab-1':
              return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <span className="font-medium">계약번호:</span> <span>2025-A-1234</span>
                    <span className="font-medium">구분:</span> <span>PQ</span>
                    <span className="font-medium">총계약금액:</span> <span>1,000,000,000</span>
                    {/* ... (기본 계약 필드) ... */}
                    <span className="font-medium">계약서:</span> <span><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></span>
                  </div>
              );
          case 'project-tab-2':
              return (
                  <div className="space-y-6">
                    <div>
                        <h4 className="text-md font-semibold mb-2">변경 및 차수 계약 이력</h4>
                        <table className="data-table">
                            <thead><tr><th>구분</th><th>변경계약일</th><th>변경 총계약금액</th><th>증빙</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td>1차 변경</td><td>2025-06-01</td><td>1,200,000,000</td>
                                    <td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h4 className="text-md font-semibold mb-2">과업 중지/재개 이력</h4>
                        <table className="data-table">
                            <thead><tr><th>구분</th><th>일자</th><th>사유</th><th>증빙</th></tr></thead>
                            <tbody>
                                <tr>
                                    <td><span className="font-bold text-red-500">중지</span></td><td>2024-08-01</td><td>발주처 사정</td>
                                    <td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                  </div>
              );
          case 'project-tab-3':
              return (
                  <div className="space-y-6">
                    <button className="btn btn-success mb-4">청구서(서식) 생성</button>
                    <div>
                        <h4 className="text-md font-semibold mb-2">청구 현황</h4>
                        <table className="data-table">
                            <thead><tr><th>청구내용</th><th>청구액</th><th>청구일</th><th>증빙</th></tr></thead>
                            <tbody>
                                <tr><td>1차 선급금</td><td>300,000,000</td><td>2025-01-08</td><td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                    {/* ... (입금, 세금계산서 테이블) ... */}
                  </div>
              );
          case 'project-tab-4':
              return <p>참여 인력 탭 (기술인 모듈과 연동)</p>;
          case 'project-tab-5':
              return (
                  <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">계약상대자 (발주처)</h3>
                        <p>한국도로공사 (123-45-67890)</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">외부 수행 (하도급/외주)</h3>
                        <table className="data-table">
                            <thead><tr><th>하도급 업체명</th><th>수행 업무</th><th>계약 금액</th><th>계약서</th></tr></thead>
                            <tbody>
                                <tr><td>(주)AA측량</td><td>현황 측량</td><td>50,000,000</td><td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(1)</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                  </div>
              );
          default:
              return <p className="dark:text-gray-400">선택된 탭: {activeTab}</p>;
      }
  };
  
  return (
     <div className="detail-page-layout">
        <div className="detail-page-header card border-b dark:border-[#3a3a3c] p-4">
             <h1 className="text-2xl font-bold dark:text-white">OO대교 기본설계 (P2025-001)</h1>
             <button onClick={() => navigateTo('project')} className="btn btn-outline">
                &larr; 목록으로
             </button>
        </div>
        <div className="detail-page-content card mt-4">
            <div className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
              <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
                {TABS.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4">
                {renderTabContent()}
            </div>
        </div>
     </div>
  );
}

// --- 8. PQ (수주) 뷰 ---
function PQListView({ navigateTo }) {
  const [activeTab, setActiveTab] = useState('pre-list'); // pre-list | post-list
  
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4 dark:text-white">PQ (수주) 관리</h1>
      <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
        {/* 탭 네비게이션 */}
        <div className="border-b dark:border-gray-700">
          <nav className="flex flex-wrap -mb-px" aria-label="Tabs">
            <button 
              onClick={() => setActiveTab('pre-list')}
              className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === 'pre-list' ? 'active' : ''}`}
            >
              발주예정 리스트
            </button>
            <button 
              onClick={() => setActiveTab('post-list')}
              className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === 'post-list' ? 'active' : ''}`}
            >
              발주 리스트 (PQ)
            </button>
          </nav>
        </div>
        
        {/* 발주예정 리스트 */}
        {activeTab === 'pre-list' && (
          <div className="mt-4">
             <div className="overflow-x-auto">
                <table className="data-table">
                    <thead><tr><th>공고명(안)</th><th>발주처</th><th>발주예정시기</th><th>컨소시엄</th><th>관리</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>[공공(안)] 2026년 OO권역 감리</td>
                            <td>국토교통부</td>
                            <td>2026년 상반기</td>
                            <td>(주)AA (40%)</td>
                            <td><button onClick={() => navigateTo('pq-pre-detail', 1)} className="btn btn-primary text-xs px-3 py-1">상세</button></td>
                        </tr>
                    </tbody>
                </table>
             </div>
          </div>
        )}
        
        {/* 발주 리스트 */}
        {activeTab === 'post-list' && (
          <div className="mt-4">
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead><tr><th>공고번호</th><th>공고명</th><th>발주처</th><th>마감일</th><th>상태</th><th>관리</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>2025-PQ-002</td>
                            <td>DD고속도로 감리 PQ</td>
                            <td>국토교통부</td>
                            <td>2024-12-15</td>
                            <td><span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">작성중</span></td>
                            <td><button onClick={() => navigateTo('pq-detail', 2)} className="btn btn-primary text-xs px-3 py-1">상세</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// --- 9. PQ (발주예정) 상세 뷰 ---
function PQPreDetailView({ pqPreId, navigateTo, openFileModal }) {
  const [activeTab, setActiveTab] = useState('pq-pre-tab-1');
  // useEffect로 `/api/pq-pre/${pqPreId}` 호출...
  
    const TABS = [
        { id: 'pq-pre-tab-1', label: '1. 컨소시엄 (안)' },
        { id: 'pq-pre-tab-2', label: '2. 예산 분석 (안)' },
        { id: 'pq-pre-tab-3', label: '3. 사전 규격 (안)' },
    ];
  
  return (
     <div className="detail-page-layout">
        <div className="detail-page-header card border-b dark:border-[#3a3a3c] p-4">
             <h1 className="text-2xl font-bold dark:text-white">[공공(안)] 2026년 OO권역 감리</h1>
             <button onClick={() => navigateTo('pq')} className="btn btn-outline">
                &larr; 목록으로
             </button>
        </div>
        <div className="detail-page-content card mt-4">
            <div className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
              <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
                {TABS.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4">
                {activeTab === 'pq-pre-tab-1' && (
                    <table className="data-table">
                        <thead><tr><th>회사명</th><th>담당자</th><th>연락처</th><th>이메일</th><th>지분율(안)</th></tr></thead>
                        <tbody>
                            <tr><td>(주)HR엔지니어링</td><td>최수주</td><td>010-1111-2222</td><td>choi@hr.co.kr</td><td>60 %</td></tr>
                            <tr><td>(주)AA엔지니어링</td><td>박참여</td><td>010-3333-4444</td><td>park@aa.co.kr</td><td>40 %</td></tr>
                        </tbody>
                    </table>
                )}
                {activeTab === 'pq-pre-tab-3' && (
                    <button onClick={openFileModal} className="btn btn-primary">사전 규격(안) 파일 관리</button>
                )}
            </div>
        </div>
     </div>
  );
}

// --- 10. PQ (발주) 상세 뷰 ---
function PQDetailView({ pqId, navigateTo, openFileModal }) {
  const [activeTab, setActiveTab] = useState('pq-tab-1');
  // useEffect로 `/api/pq/${pqId}` 호출...
  
    const TABS = [
        { id: 'pq-tab-1', label: '1. 기본 정보' },
        { id: 'pq-tab-2', label: '2. 참여 기술인' },
        { id: 'pq-tab-3', label: '3. 관련 실적' },
        { id: 'pq-tab-4', label: '4. 공고 자료 및 서류' },
        { id: 'pq-tab-5', label: '5. 컨소시엄 관리' },
        { id: 'pq-tab-6', label: '6. 예산(안) 분석' },
    ];
  
  return (
     <div className="detail-page-layout">
        <div className="detail-page-header card border-b dark:border-[#3a3a3c] p-4">
             <h1 className="text-2xl font-bold dark:text-white">DD고속도로 감리 PQ</h1>
             <button onClick={() => navigateTo('pq')} className="btn btn-outline">
                &larr; 목록으로
             </button>
        </div>
        <div className="detail-page-content card mt-4">
            <div className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
              <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
                {TABS.map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-4">
                {activeTab === 'pq-tab-2' && (
                    <div>
                        <button className="btn btn-success mb-4">기술인 자료 자동 생성</button>
                        <p>기술인 관리 모듈에서 데이터를 자동으로 불러옵니다.</p>
                    </div>
                )}
                {activeTab === 'pq-tab-4' && (
                    <button onClick={openFileModal} className="btn btn-primary">공고 자료 관리</button>
                )}
                {activeTab === 'pq-tab-5' && (
                    <table className="data-table">
                        <thead><tr><th>구분</th><th>참여사</th><th>지분율 (%)</th></tr></thead>
                        <tbody>
                            <tr><td>주관사</td><td>(주)HR엔지니어링</td><td>60 %</td></tr>
                            <tr><td>참여사</td><td>(주)AA엔지니어링</td><td>40 %</td></tr>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
     </div>
  );
}

// --- 11. 기타 뷰 컴포넌트 (면허, 거래처 등) ---
function LicenseListView({ navigateTo }) { 
    return (
        <section>
          <h1 className="text-2xl font-bold mb-4 dark:text-white">면허 관리</h1>
          <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
            <table className="data-table">
                <thead><tr><th>면허명</th><th>등록번호</th><th>갱신일</th><th>기술인 충족</th><th>관리</th></tr></thead>
                <tbody>
                    <tr><td>건설엔지니어링(종합)</td><td>서울-01-123</td><td>2023-01-01</td><td><span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">충족</span></td><td><button onClick={() => navigateTo('license-detail', 1)} className="btn btn-primary text-xs px-3 py-1">상세</button></td></tr>
                    <tr><td>안전진단(교량)</td><td>서울-02-456</td><td>2024-05-10</td><td><span className="px-2 py-1 bg-red-200 text-red-800 rounded-full text-xs">미달(1)</span></td><td><button onClick={() => navigateTo('license-detail', 2)} className="btn btn-primary text-xs px-3 py-1">상세</button></td></tr>
                </tbody>
            </table>
          </div>
        </section>
    );
}

function LicenseDetailView({ licenseId, navigateTo, openFileModal }) {
    const [activeTab, setActiveTab] = useState('license-tab-1');
    // useEffect로 `/api/license/${licenseId}` 호출...
    const TABS = [
        { id: 'license-tab-1', label: '1. 기본 정보' },
        { id: 'license-tab-2', label: '2. 갱신 이력' },
        { id: 'license-tab-3', label: '3. 필수 기술인' },
    ];
    return (
        <div className="detail-page-layout">
            <div className="detail-page-header card border-b dark:border-[#3a3a3c] p-4">
                 <h1 className="text-2xl font-bold dark:text-white">건설엔지니어링(종합)</h1>
                 <button onClick={() => navigateTo('license')} className="btn btn-outline">
                    &larr; 목록으로
                 </button>
            </div>
            <div className="detail-page-content card mt-4">
                <div className="border-b dark:border-gray-700 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
                  <nav className="flex flex-wrap -mb-px px-4" aria-label="Tabs">
                    {TABS.map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button whitespace-nowrap py-3 px-4 text-sm font-medium ${activeTab === tab.id ? 'active' : ''}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="p-4">
                    {activeTab === 'license-tab-1' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold mb-2">면허 증빙 자료</h3>
                                <button onClick={openFileModal} className="btn btn-primary">등록증 사본 관리</button>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">면허 유지 조건</h3>
                                <p>자본금: 500,000,000 원</p>
                                <p>보유 장비: 3 / 5 (충족)</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ClientListView() { return <div className="dark:text-white">거래처 관리 뷰</div>; }
function DocumentView({ openFileModal }) { 
    return (
        <section>
            <h1 className="text-2xl font-bold mb-4">문서 관리</h1>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                    <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
                        <h2 className="font-semibold mb-3">문서 분류</h2>
                        <nav className="flex flex-col space-y-2">
                            <a href="#" className="px-3 py-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">전체 문서</a>
                            <a href="#" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">발송 공문</a>
                            <a href="#" className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">접수 공문</a>
                            {/* ... (다른 분류) ... */}
                        </nav>
                    </div>
                </div>
                <div className="w-full md:w-3/4">
                    <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
                        <table className="data-table">
                            <thead><tr><th>문서 번호</th><th>제목</th><th>분류</th><th>파일</th></tr></thead>
                            <tbody>
                                <tr><td>시행-2025-001</td><td>선급금 신청 (1차)</td><td>발송 공문</td><td><button onClick={openFileModal} className="btn btn-outline text-xs px-2 py-1">파일(2)</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
function EstimateView({ openFileModal }) { return <div className="dark:text-white">견적 관리 뷰</div>; }
function WeeklyView() { 
    return (
        <section>
            <h1 className="text-2xl font-bold mb-4">주간회의 자료</h1>
            <div className="card border dark:border-[#3a3a3c] p-4 rounded-lg shadow">
                <button className="btn btn-primary mb-4">
                    이번 주 자료 자동 생성 (PDF)
                </button>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold border-b dark:border-gray-700 pb-2 mb-3">1. 계약 / 착수 현황</h2>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>P2025-001 (OO대교): 1차 선급금 청구 (1/8) 및 입금 완료 (1/15)</li>
                        </ul>
                    </div>
                    {/* ... (다른 주간회의 섹션) ... */}
                </div>
            </div>
        </section>
    );
}

// --- 12. 모달 컴포넌트 ---
function FileManagerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal flex" onClick={onClose}>
      <div className="card border dark:border-[#3a3a3c] rounded-lg shadow-xl modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b dark:border-[#3a3a3c]">
          <h2 className="text-lg font-semibold text-black dark:text-white">파일 관리</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">&times;</button>
        </div>
        <div className="p-4 border-b bg-gray-50 dark:bg-[#2c2c2e] text-sm">
          <span className="text-gray-500">현재 경로:</span> / 기술인 / 홍길동 / 기술자격 /
        </div>
        <div className="p-4 overflow-y-auto">
          <table className="data-table">
            <thead><tr><th>파일명</th><th>업로드 날짜</th><th>크기</th><th>관리</th></tr></thead>
            <tbody>
              <tr><td>토목시공기술사_자격증사본.pdf</td><td>2025-01-10</td><td>1.2 MB</td><td><button className="btn btn-secondary text-xs px-2 py-1">삭제</button></td></tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t dark:border-[#3a3a3c] mt-auto">
          <button className="btn btn-success">신규 파일 업로드</button>
        </div>
      </div>
    </div>
  );
}

function TechCareerModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    
    return (
        <div className="modal flex" onClick={onClose}>
            <div className="card border dark:border-[#3a3a3c] rounded-lg shadow-xl modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-[#3a3a3c]">
                    <h2 className="text-lg font-semibold text-black dark:text-white">기술경력 신규 등록</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">사업명</label>
                            <input type="text" className="form-input" />
                        </div>
                         <div>
                            <label className="form-label">발주자</label>
                            <input type="text" className="form-input" />
                        </div>
                        {/* ... (다른 폼 필드) ... */}
                        <div>
                            <label className="form-label">직무분야</label>
                            <select className="form-select">
                                <option>토목</option><option>건축</option><option>안전관리</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">전문분야</label>
                            <select className="form-select">
                                <option>도로및공항</option><option>항만및해안</option><option>구조</option>
                            </select>
                        </div>
                         <div>
                            <label className="form-label">책임정도</label>
                            <select className="form-select">
                                <option>사업책임기술인</option><option>분야책임기술인</option><option>분야참여기술인</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">담당업무</label>
                            <select className="form-select">
                                <option>설계</option><option>시공</option><option>건설사업관리</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div className="p-4 border-t dark:border-[#3a3a3c] mt-auto flex justify-end space-x-2">
                    <button onClick={onClose} className="btn btn-outline">취소</button>
                    <button className="btn btn-primary">저장</button>
                </div>
            </div>
        </div>
    );
}


// --- 13. 아이콘 컴포넌트 ---
const SheetsIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
);
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.66-5.66l-.707-.707M4.04 4.04l-.707-.707m15.92 0l-.707.707M4.04 19.96l-.707.707M21 12h-1M4 12H3m16.66-7.96l-.707.707M7.04 7.04l-.707.707"></path></svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
);
const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
);
const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
);
const ProfileIcon = () => (
  <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
);