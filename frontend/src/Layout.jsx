import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Sidebar = () => (
  <aside className="w-16 md:w-56 bg-gray-800 text-gray-300 flex flex-col border-r border-gray-700">
    <div className="text-white font-bold text-2xl p-4 text-center">E</div>
    <nav className="flex flex-col mt-4">
      <NavLink to="/projects/1" className={({ isActive }) => `flex items-center p-4 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
        <span className="md:mr-4 text-xl">📄</span> <span className="hidden md:inline">프로젝트</span>
      </NavLink>
      <NavLink to="/technicians/1" className={({ isActive }) => `flex items-center p-4 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
        <span className="md:mr-4 text-xl">👥</span> <span className="hidden md:inline">기술인</span>
      </NavLink>
       <NavLink to="/companies" className={({ isActive }) => `flex items-center p-4 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
        <span className="md:mr-4 text-xl">🏢</span> <span className="hidden md:inline">관계사</span>
      </NavLink>
       <NavLink to="/billing" className={({ isActive }) => `flex items-center p-4 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'}`}>
        <span className="md:mr-4 text-xl">💰</span> <span className="hidden md:inline">청구/입금</span>
      </NavLink>
    </nav>
    <div className="mt-auto p-4">
      <a href="#" className="flex items-center hover:bg-gray-700 p-2 rounded">
        <span className="md:mr-4 text-xl">⚙️</span> <span className="hidden md:inline">설정</span>
      </a>
    </div>
  </aside>
);

const Header = ({ breadcrumbs }) => (
    <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
        <div>{breadcrumbs}</div>
        <div className="flex items-center space-x-4">
            <span>☀️</span>
            <span>김재진 님</span>
        </div>
    </header>
);

const Layout = () => {
  // 이 부분은 향후 React Router의 useMatches 등을 사용하여 동적으로 생성됩니다.
  const breadcrumbs = <span className="text-sm">ERP / 프로젝트 / 서울시청 본관 리모델링</span>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-900">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
        <footer className="text-center text-xs text-gray-500 p-2 bg-gray-800 border-t border-gray-700">
          "The only way to do great work is to love what you do." - Steve Jobs
        </footer>
      </div>
    </div>
  );
};

export default Layout;