import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, DollarSign, TrendingUp,
  ClipboardCheck, FileText, Award, CalendarDays, Palette, ChevronsLeft
} from 'lucide-react';

// NavItem 컴포넌트는 지휘관님의 기존 코드와 동일합니다.
const NavItem = ({ to, icon: Icon, children }) => {
  const baseClasses = "flex items-center w-full h-12 px-4 rounded-lg transition-colors";
  const inactiveClasses = "text-text-muted hover:bg-tab-hover hover:text-text-color";
  const activeClasses = "bg-accent text-white font-bold";

  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      >
        <Icon size={20} className="mr-4 flex-shrink-0" />
        <span className="truncate">{children}</span>
      </NavLink>
    </li>
  );
};

const Sidebar = () => {
  // [추가] 사이드바 접힘/펼침 상태를 관리할 state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // [추가] 토글 버튼 클릭 시 호출될 함수
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    // [수정] isCollapsed 상태에 따라 너비를 동적으로 변경
    <div className={`flex-shrink-0 flex flex-col border-r border-separator bg-card-bg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* [수정] 헤더 영역에 토글 버튼 추가 */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* isCollapsed가 아닐 때만 ERP 텍스트 표시 */}
        {!isCollapsed && <h1 className="text-xl font-bold text-text-color">ERP</h1>}
        
        {/* [핵심 복원] 사라졌던 사이드바 토글 버튼 */}
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-tab-hover">
          <ChevronsLeft 
            size={20} 
            className={`text-text-muted transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {/* [수정] NavItem의 자식(span)이 isCollapsed 상태에 따라 보이거나 숨겨지도록 수정 */}
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-2">
          {/* NavItem 컴포넌트를 수정하여 span을 제어합니다. */}
          <NavLink to="/projects" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <LayoutDashboard size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">프로젝트</span>}
          </NavLink>
          <NavLink to="/technicians" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <Users size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">기술인</span>}
          </NavLink>
          <NavLink to="/companies" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <Building2 size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">관계사</span>}
          </NavLink>
          <NavLink to="/billing" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <DollarSign size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">청구/입금</span>}
          </NavLink>
           <NavLink to="/evaluations" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <TrendingUp size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">사업수행능력평가</span>}
          </NavLink>
          <NavLink to="/bidding" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <ClipboardCheck size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">입찰분석</span>}
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <FileText size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">문서/서식</span>}
          </NavLink>
          <NavLink to="/licenses" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <Award size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">업/면허</span>}
          </NavLink>
          <NavLink to="/meetings" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <CalendarDays size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">주간회의</span>}
          </NavLink>
        </ul>
      </nav>
      <div className="px-4 py-4">
        <ul>
          <NavLink to="/theme" className={({ isActive }) => `flex items-center w-full h-12 px-4 rounded-lg transition-colors ${isActive ? 'bg-accent text-white font-bold' : 'text-text-muted hover:bg-tab-hover hover:text-text-color'}`}>
            <Palette size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="ml-4 truncate">테마</span>}
          </NavLink>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;