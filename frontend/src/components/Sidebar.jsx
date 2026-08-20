import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, ListCollapse, FileText, AlertTriangle, CreditCard, Star } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Technicians', path: '/admin/technicians', icon: Wrench },
    { name: 'Customers', path: '/admin/users', icon: Users },
    { name: 'Categories', path: '/admin/categories', icon: ListCollapse },
    { name: 'Service Requests', path: '/admin/requests', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-400 min-h-[calc(100vh-4rem)] border-r border-gray-800 shrink-0 hidden md:block">
      <div className="p-6">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Administration</span>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
