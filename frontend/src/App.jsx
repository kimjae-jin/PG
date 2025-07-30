import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useParams, Link } from 'react-router-dom';

const menuItems = [
    { to: "/projects", icon: "📄", label: "프로젝트" },
    { to: "/technicians", icon: "👥", label: "기술인" },
    { to: "/companies", icon: "🏢", label: "관계사" },
    { to: "/billing", icon: "💰", label: "청구/입금" },
    { to: "/licenses", icon: "📜", label: "업면허" },
    { to: "/meetings", icon: "📅", label: "주간회의" },
];

const Sidebar = ({ isOpen, setIsOpen }) => (
    <aside className={`bg-[--card] border-r border-[--border] flex flex-col transition-all duration-300 ease-in-out relative ${isOpen ? 'w-56' : 'w-20'}`}>
        <Link to="/" className="text-3xl font-bold p-4 text-center text-white hover:text-[--accent] transition-colors shrink-0">{isOpen ? 'PG' : 'P'}</Link>
        <div className="flex flex-col flex-grow overflow-hidden">
            <nav className="flex-grow p-2 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => 
                        `flex items-center p-3 rounded-lg hover:bg-[--border] transition-colors ${isActive ? 'bg-[--accent] text-white' : ''}`
                    }>
                        <span className="text-2xl sidebar-icon">{item.icon}</span>
                        <span className={`ml-4 whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-2 border-t border-[--border] shrink-0">
                <NavLink to="/theme" className="flex items-center p-3 rounded-lg hover:bg-[--border] transition-colors">
                    <span className="text-2xl sidebar-icon">🎨</span>
                    <span className={`ml-4 whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>테마</span>
                </NavLink>
            </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="absolute top-1/2 -right-3.5 h-7 w-7 bg-[--accent] text-white flex items-center justify-center rounded-full transform -translate-y-1/2 focus:outline-none ring-4 ring-[--bg] hover:opacity-80 transition-opacity">
            {isOpen ? '‹' : '›'}
        </button>
    </aside>
);

const Header = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'pg-gray');
    const [isDark, setIsDark] = useState(localStorage.getItem('mode') !== 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', theme);
        localStorage.setItem('mode', isDark ? 'dark' : 'light');
    }, [theme, isDark]);

    // Breadcrumbs 로직 (향후 프로젝트 이름 동적 처리 필요)
    const location = useLocation();
    const params = useParams();
    let pathnames = location.pathname.split('/').filter(x => x);
    
    return (
        <header className="flex justify-between items-center p-4 bg-[--bg] border-b border-[--border]">
            <div className="text-sm text-[--text-secondary]">
                <Link to="/" className="hover:text-[--accent]">PG</Link>
                {pathnames.map((value, index) => {
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathnames.length - 1;
                    let displayValue = value === 'projects' ? '프로젝트' : value;
                    if(isLast && params.projectId) displayValue = '서울시청 본관...'; // 임시
                    return (
                        <React.Fragment key={to}>
                            <span className="mx-2">/</span>
                            {isLast ? <span className="text-[--text] font-semibold">{displayValue}</span> : <Link to={to} className="hover:text-[--accent]">{displayValue}</Link>}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="flex items-center space-x-4">
                <button onClick={() => setIsDark(!isDark)} className="text-2xl">{isDark ? '☀️' : '🌙'}</button>
                <span className="text-sm">여니서방 님</span>
            </div>
        </header>
    );
};

const App = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default App;