import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

const menuItems = [
    { to: "/projects", icon: "📄", label: "프로젝트" },
    { to: "/technicians", icon: "👥", label: "기술인" },
    { to: "/companies", icon: "🏢", label: "관계사" },
    { to: "/billing", icon: "💰", label: "청구/입금/세금" },
    { to: "/analysis", icon: "📊", label: "입찰분석" },
    { to: "/evaluation", icon: "📈", label: "사업수행능력평가" },
    { to: "/licenses", icon: "📜", label: "업/면허" },
    { to: "/docs", icon: "📁", label: "문서/서식" },
    { to: "/meetings", icon: "📅", label: "주간회의" },
    { to: "/management", icon: "견적관리", label: "견적관리" }, // 아이콘 임시 추가
    { to: "/attendance", icon: "주간회의", label: "주간회의" }, // 아이콘 임시 추가
];

const Sidebar = () => (
    <aside className="w-16 md:w-56 bg-navy-light text-gray-300 flex flex-col flex-shrink-0">
        <div className="text-white font-bold text-3xl p-4 text-center h-16 flex items-center justify-center">E</div>
        <nav className="flex flex-col mt-2 flex-grow overflow-y-auto">
            {menuItems.map(item => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => 
                    `flex items-center p-4 hover:bg-navy-lighter transition-colors ${isActive ? 'bg-accent-blue text-white' : ''}`
                }>
                    <span className="text-2xl w-8 text-center">{item.icon}</span>
                    <span className="hidden md:inline ml-3 whitespace-nowrap">{item.label}</span>
                </NavLink>
            ))}
        </nav>
        <div className="p-2 border-t border-navy-lighter">
            <NavLink to="/theme" className="flex items-center p-4 hover:bg-navy-lighter transition-colors">
                <span className="text-2xl w-8 text-center">🎨</span>
                <span className="hidden md:inline ml-3 whitespace-nowrap">테마</span>
            </NavLink>
        </div>
    </aside>
);

const Header = () => {
    // Breadcrumbs 로직 (향후 동적 처리 필요)
    const location = useLocation();
    // 이 부분은 더 정교한 라이브러리(ex: use-react-router-breadcrumbs)나 로직으로 개선될 수 있습니다.
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = `ERP / ${pathnames.join(' / ')}`;

    return (
        <header className="flex justify-between items-center p-4 bg-navy-dark text-gray-400 border-b border-navy-lighter h-16 flex-shrink-0">
            <div>{breadcrumbs}</div>
            <div className="flex items-center space-x-4">
                <button className="text-2xl">☀️</button>
                <span>여니서방 님</span>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="text-center text-xs text-gray-500 p-2 bg-navy-dark border-t border-navy-lighter">
        "The only way to do great work is to love what you do." - Steve Jobs
    </footer>
);

const App = () => {
    return (
        <div className="flex h-screen bg-navy text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default App;