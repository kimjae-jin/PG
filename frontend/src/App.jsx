import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useParams } from 'react-router-dom';

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
    <aside className="w-18 md:w-56 bg-navy-light text-gray-300 flex flex-col">
        <div className="text-white font-bold text-3xl p-4 text-center">E</div>
        <nav className="flex flex-col mt-2 flex-grow">
            {menuItems.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => 
                    `flex items-center p-4 hover:bg-navy-lighter transition-colors ${isActive ? 'bg-accent-blue text-white' : ''}`
                }>
                    <span className="text-2xl sidebar-icon">{item.icon}</span>
                    <span className="hidden md:inline ml-4 whitespace-nowrap">{item.label}</span>
                </NavLink>
            ))}
        </nav>
        <div className="p-2 border-t border-navy-lighter">
            <NavLink to="/theme" className="flex items-center p-4 hover:bg-navy-lighter transition-colors">
                <span className="text-2xl sidebar-icon">🎨</span>
                <span className="hidden md:inline ml-4 whitespace-nowrap">테마</span>
            </NavLink>
        </div>
    </aside>
);

const Header = () => {
    const [isDark, setIsDark] = useState(() => localStorage.getItem('mode') !== 'light');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('mode', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('mode', 'light');
        }
    }, [isDark]);

    // Breadcrumbs 로직 (향후 동적 처리)
    const breadcrumbs = `ERP / 프로젝트 / 서울시청 본관 리모델링`;

    return (
        <header className="flex justify-between items-center p-4 bg-navy-dark text-gray-400 border-b border-navy-lighter">
            <div className="text-sm">{breadcrumbs}</div>
            <div className="flex items-center space-x-4">
                <button onClick={() => setIsDark(!isDark)} className="text-2xl">
                    {isDark ? '☀️' : '🌙'}
                </button>
                <span className="text-sm">여니서방</span>
            </div>
        </header>
    );
};

const App = () => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col bg-navy text-white">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default App;