import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaLock, 
  FaHome, 
  FaBook, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaCog, 
  FaChevronLeft, 
  FaChevronRight,
  FaStar,
  FaChartLine,
  FaListUl
} from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, profile } = useAuthStore();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Dashboard' },
    { path: '/notes', icon: <FaBook />, label: 'Notes' },
    { path: '/calendar', icon: <FaCalendarAlt />, label: 'Calendar' },
    { path: '/money', icon: <FaMoneyBillWave />, label: 'Money' },
    { path: '/todo', icon: <FaListUl />, label: 'Tasks' },
    { path: '/habits', icon: <FaChartLine />, label: 'Habits' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
  ];
  
  return (
    <div 
      className={`sidebar h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <FaLock className="text-indigo-600 text-xl" />
          {!collapsed && (
            <h1 className="ml-2 text-lg font-bold text-slate-800 dark:text-white">
              Lock The Eff In
            </h1>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {!collapsed && (
          <div className="p-4">
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold mb-2">
                Favorites
              </h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <FaStar className="text-amber-500" />
                    <span className="ml-3">Weekly Planning</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="flex items-center p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <FaStar className="text-amber-500" />
                    <span className="ml-3">Budget Overview</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {profile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {profile?.displayName || user?.email || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
