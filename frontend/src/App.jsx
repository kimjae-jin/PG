import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Sun, Moon, UserCircle, ChevronRight } from 'lucide-react';

// [핵심 수정] 전역 상태 관리를 위한 Context 생성
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// [핵심 수정] Breadcrumb가 전역 상태를 사용하도록 변경
const Breadcrumb = () => {
    const { breadcrumbData } = useAppContext();
    const location = useLocation();
    const paths = location.pathname.split('/').filter(p => p);
    
    return (
        <div className="flex items-center text-sm font-semibold text-text-muted">
            <Link to="/" className="hover:text-text-color">ERP</Link>
            {paths.length > 0 && <ChevronRight size={16} className="mx-1" />}
            {paths[0] === 'projects' && <Link to="/projects" className="hover:text-text-color">프로젝트</Link>}
            {paths[1] && <ChevronRight size={16} className="mx-1" />}
            {/* 전역 상태에 저장된 프로젝트 넘버를 표시 */}
            {paths[1] && paths[0] === 'projects' && <span>{paths[1] === 'new' ? '신규 등록' : breadcrumbData.projectNo || `ID: ${paths[1]}`}</span>}
        </div>
    );
}

function App() {
  const [currentTime, setCurrentTime] = useState('');
  // [핵심 수정] Breadcrumb를 위한 전역 상태
  const [breadcrumbData, setBreadcrumbData] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      const options = { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setCurrentTime(new Date().toLocaleString('ko-KR', options));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AppContext.Provider value={{ breadcrumbData, setBreadcrumbData }}>
        <div className="flex h-screen bg-main-bg text-text-color">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="flex-shrink-0 bg-card-bg h-16 flex items-center justify-between px-6 border-b border-separator">
              <div><Breadcrumb /></div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-text-muted">{currentTime}</span>
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-tab-hover"><Sun size={18} /></button>
                </div>
                <div className="flex items-center space-x-2">
                    <UserCircle size={24} />
                    <span className="font-semibold">여니서방 님</span>
                </div>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              <Outlet context={{ setBreadcrumbData }} />
            </div>
          </main>
        </div>
    </AppContext.Provider>
  );
}

export default App;