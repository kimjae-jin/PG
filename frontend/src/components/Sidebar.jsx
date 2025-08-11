import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  FileText,
  Award,
  CalendarDays,
  Palette
} from 'lucide-react';

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
  return (
    <div className="w-64 bg-card-bg flex-shrink-0 flex flex-col border-r border-separator">
      <div className="h-16 flex items-center px-6">
        <h1 className="text-xl font-bold text-text-color">ERP</h1>
      </div>
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-2">
          <NavItem to="/projects" icon={LayoutDashboard}>프로젝트</NavItem>
          <NavItem to="/technicians" icon={Users}>기술인</NavItem>
          <NavItem to="/companies" icon={Building2}>관계사</NavItem>
          <NavItem to="/billing" icon={DollarSign}>청구/입금</NavItem>
          <NavItem to="/evaluations" icon={TrendingUp}>사업수행능력평가</NavItem>
          <NavItem to="/bidding" icon={ClipboardCheck}>입찰분석</NavItem>
          <NavItem to="/documents" icon={FileText}>문서/서식</NavItem>
          <NavItem to="/licenses" icon={Award}>업/면허</NavItem>
          <NavItem to="/meetings" icon={CalendarDays}>주간회의</NavItem>
        </ul>
      </nav>
      <div className="px-4 py-4">
        <ul>
          <NavItem to="/theme" icon={Palette}>테마</NavItem>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;