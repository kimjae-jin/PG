// frontend/src/App.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { ThemeContext } from './contexts/ThemeContext.jsx';

const menuItems = [ { to: "/projects", icon: "📄", label: "프로젝트" }, { to: "/technicians", icon: "👥", label: "기술인" }, { to: "/companies", icon: "🏢", label: "관계사" }, { to: "/billing", icon: "💰", label: "청구/입금" }, { to: "/evaluation", icon: "📈", label: "사업수행능력평가" }, { to: "/analysis", icon: "📊", label: "입찰분석" }, { to: "/docs", icon: "📁", label: "문서/서식" }, { to: "/licenses", icon: "📜", label: "업/면허" }, { to: "/meetings", icon: "📅", label: "주간회의" }, ];

const Sidebar = ({ isCollapsed, onToggle }) => (
    <aside className={`relative bg-sidebar-bg flex-shrink-0 p-2 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-56'}`}>
        <div className="text-text-color font-bold text-3xl p-4 text-center h-16 flex items-center justify-center">E</div>
        <nav className="flex flex-col mt-2 flex-grow overflow-y-auto">{menuItems.map(item => ( <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-accent text-white' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}> <span className="text-2xl w-8 text-center">{item.icon}</span> <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>{item.label}</span> </NavLink> ))}</nav>
        <div className="p-2 border-t border-separator"> <NavLink to="/theme" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? 'bg-accent text-white' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}> <span className="text-2xl w-8 text-center">🎨</span> <span className={`ml-3 whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>테마</span> </NavLink> </div>
        <button onClick={onToggle} className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-card-bg border-2 border-separator rounded-full flex items-center justify-center text-text-muted hover:bg-accent hover:text-white transition-all duration-300 focus:outline-none z-20" title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}> {isCollapsed ? '›' : '‹'} </button>
    </aside>
);

const Header = ({ projectNo }) => { const { mode, toggleMode, isModeSwitchable } = useContext(ThemeContext); const location = useLocation(); const buildBreadcrumbs = () => { const pathnames = location.pathname.split('/').filter(x => x); const crumbs = [<NavLink key="home" to="/" className="hover:text-accent">ERP</NavLink>]; const pathMap = { 'projects': '프로젝트', 'technicians': '기술인', 'theme': '테마 설정', 'billing': '청구/입금' }; let currentLink = ''; pathnames.forEach(value => { currentLink += `/${value}`; if (pathMap[value]) { crumbs.push(<span key={`sep_${value}`} className="mx-2 text-text-muted">{'>'}</span>); crumbs.push(<NavLink key={value} to={currentLink} className="hover:text-accent">{pathMap[value]}</NavLink>); } else if (projectNo) { crumbs.push(<span key={`sep_${value}`} className="mx-2 text-text-muted">{'>'}</span>); crumbs.push(<span key="detail" className="font-semibold text-text-color">{projectNo}</span>); } }); return crumbs; }; return ( <header className="flex justify-between items-center p-4 bg-card-bg text-text-color border-b border-separator h-16 flex-shrink-0"> <div className="flex items-center space-x-2 text-sm">{buildBreadcrumbs()}</div> <div className="flex items-center space-x-4"><button onClick={toggleMode} disabled={!isModeSwitchable} className="text-2xl disabled:opacity-50 disabled:cursor-not-allowed" title={isModeSwitchable ? '라이트/다크 모드 전환' : '이 테마는 다크 모드만 지원합니다.'}>{mode === 'dark' ? '☀️' : '🌙'}</button><span>여니서방 님</span></div> </header> ); };

const App = () => {
    const { theme, mode } = useContext(ThemeContext);
    const [projectNo, setProjectNo] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    return (
        <div className={`${theme} ${mode} bg-background text-text-color font-sans flex h-screen`}>
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header projectNo={projectNo} />
                {/* [수정] <main> 태그에서 여백(p-4 md:p-6) 클래스를 제거 */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet context={{ setProjectNo }} />
                </main>
            </div>
        </div>
    );
};

export default App;