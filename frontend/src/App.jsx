import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link, useOutletContext } from 'react-router-dom';

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
    // 다크모드 여부 판단 로직은 그대로 유지
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
                <button className="text-2xl">☀️</button>
                <span>여니서방 님</span>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="text-center text-xs text-text-secondary p-2 bg-header border-t border-border-primary">
        "The only way to do great work is to love what you do." - Steve Jobs
    </footer>
);

const App = () => {
    const [pageTitle, setPageTitle] = useState('');
    const location = useLocation();

    useEffect(() => {
        // 페이지 이동 시 동적 제목 초기화
        setPageTitle('');
    }, [location.pathname]);

    // 브레드크럼 데이터 생성 로직
    const pathnames = location.pathname.split('/').filter(Boolean);
    const breadcrumbData = [{ label: 'ERP', link: '/' }];
    
    if (pathnames[0] === 'projects') {
        breadcrumbData.push({ label: '프로젝트', link: '/projects' });
        if (pathnames[1] && pageTitle) {
            breadcrumbData.push({ label: pageTitle });
        }
    }
    // 다른 경로에 대한 브레드크럼 로직 추가 가능

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header breadcrumbData={breadcrumbData} />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet context={{ setPageTitle }} />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;