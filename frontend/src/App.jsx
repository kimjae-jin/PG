import React, { useState, useEffect, useContext } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import ThemeContext from './contexts/ThemeContext';

const menuItems = [
    { to: "/projects", icon: "📄", label: "프로젝트" },
    { to: "/technicians", icon: "👥", label: "기술인" },
    { to: "/companies", icon: "🏢", label: "관계사" },
    { to: "/billing", icon: "💰", label: "청구/입금" },
    { to: "/evaluation", icon: "📈", label: "사업수행능력평가" },
    { to: "/analysis", icon: "📊", label: "입찰분석" },
    { to: "/docs", icon: "📁", label: "문서/서식" },
    { to: "/licenses", icon: "📜", label: "업/면허" },
    { to: "/meetings", icon: "📅", label: "주간회의" },
];

const Sidebar = () => (
    <aside className="w-16 md:w-56 bg-secondary text-text-primary flex flex-col flex-shrink-0">
        <div className="text-text-primary font-bold text-3xl p-4 text-center h-16 flex items-center justify-center">E</div>
        <nav className="flex flex-col mt-2 flex-grow overflow-y-auto">
            {menuItems.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => 
                    `flex items-center p-4 hover:bg-tertiary transition-colors ${isActive ? 'bg-accent-primary text-white' : ''}`
                }>
                    <span className="text-2xl w-8 text-center sidebar-icon">{item.icon}</span>
                    <span className="hidden md:inline ml-3 whitespace-nowrap">{item.label}</span>
                </NavLink>
            ))}
        </nav>
        <div className="p-2 border-t border-border-primary">
            <NavLink to="/theme" className="flex items-center p-4 hover:bg-tertiary transition-colors">
                <span className="text-2xl w-8 text-center sidebar-icon">🎨</span>
                <span className="hidden md:inline ml-3 whitespace-nowrap">테마</span>
            </NavLink>
        </div>
    </aside>
);

const Header = ({ breadcrumbData }) => {
    const { mode, toggleMode, isModeSwitchable } = useContext(ThemeContext);

    return (
        <header className="flex justify-between items-center p-4 bg-header text-text-primary border-b border-border-primary h-16 flex-shrink-0">
            <div className="flex items-center space-x-2 text-sm">
                {breadcrumbData.map((crumb, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="text-text-secondary">/</span>}
                        {crumb.link ? (
                            <Link to={crumb.link} className="hover:underline hover:text-accent-primary">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-text-primary">{crumb.label}</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={toggleMode}
                    disabled={!isModeSwitchable}
                    className="text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isModeSwitchable ? '라이트/다크 모드 전환' : '이 테마는 다크 모드만 지원합니다.'}
                >
                    {mode === 'dark' ? '☀️' : '🌙'}
                </button>
                <span>여니서방 님</span>
            </div>
        </header>
    );
};

// [핵심 수정] Footer 컴포넌트 정의를 완전히 삭제합니다.

const App = () => {
    const [pageTitle, setPageTitle] = useState('');
    const location = useLocation();

    useEffect(() => {
        setPageTitle('');
    }, [location.pathname]);

    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbData = [{ label: 'ERP', link: '/' }];
    
    if (pathnames[0] === 'projects') {
        breadcrumbData.push({ label: '프로젝트', link: '/projects' });
        if (pathnames[1] && pageTitle) {
            breadcrumbData.push({ label: pageTitle });
        }
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header breadcrumbData={breadcrumbData} />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet context={{ setPageTitle }} />
                </main>
                {/* [핵심 수정] <Footer /> 컴포넌트 호출부를 삭제합니다. */}
            </div>
        </div>
    );
};

export default App;