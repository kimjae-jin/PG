import React from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between h-16 px-6 bg-background border-b border-border flex-shrink-0">
      <div className="flex items-center">
        {/* Can be used for breadcrumbs or page titles */}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-surface">
          <Bell className="h-6 w-6 text-text-secondary" />
        </button>
        <button className="p-2 rounded-full hover:bg-surface">
          <UserCircle className="h-6 w-6 text-text-secondary" />
        </button>
      </div>
    </header>
  );
};

export default Header;
