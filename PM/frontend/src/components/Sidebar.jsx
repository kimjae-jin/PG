import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, GanttChartSquare, Briefcase } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Technicians', href: '/technicians', icon: Users },
  { name: 'Bids', href: '/bids', icon: FileText },
  { name: 'Contracts', href: '/contracts', icon: GanttChartSquare },
];

const Sidebar = () => {
  const linkClasses = "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors";
  const activeClasses = "bg-surface text-text-primary";
  const inactiveClasses = "text-text-secondary hover:bg-surface hover:text-text-primary";

  return (
    <div className="flex flex-col w-64 bg-background border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <Briefcase className="h-8 w-8 text-primary" />
        <span className="ml-2 text-xl font-semibold text-text-primary">BidSys</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-6">
          <ul>
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => `${linkClasses} ${isActive ? activeClasses : inactiveClasses}`}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
