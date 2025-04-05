import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSun, FaMoon, FaBell, FaSearch, FaLock, FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuthStore } from '../../store/authStore';
import GlobalSearch from '../search/GlobalSearch';

interface HeaderProps {
  toggleTheme: () => void;
  theme: 'light' | 'dark';
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  toggleTheme, 
  theme, 
  toggleSidebar,
  isSidebarOpen 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, profile, logout } = useAuthStore();
  const location = useLocation();
  
  // Get the current page title based on the route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/notes')) return 'Notes';
    if (path.startsWith('/calendar')) return 'Calendar';
    if (path.startsWith('/money')) return 'Money';
    if (path.startsWith('/habits')) return 'Habits';
    if (path.startsWith('/todo')) return 'Todo';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Lock The Eff In';
  };
  
  // Open the global search modal
  const openSearch = () => {
    setIsSearchOpen(true);
  };
  
  // Handle keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-2 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {toggleSidebar && (
              <button 
                onClick={toggleSidebar}
                className="p-2 mr-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <FaBars />
              </button>
            )}
            
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {getPageTitle()}
            </h1>
            
            <div className="ml-8 hidden md:block">
              <button 
                onClick={openSearch}
                className="flex items-center py-1.5 px-3 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <FaSearch className="mr-2" />
                <span>Search...</span>
                <div className="ml-4 px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <span className="mr-1">⌘</span>K
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            <button 
              onClick={openSearch}
              className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Search"
            >
              <FaSearch />
            </button>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
            
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                aria-label="Notifications"
              >
                <FaBell />
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full"></span>
              </button>
            </div>
            
            <div className="hidden sm:flex items-center">
              <button className="btn-primary flex items-center">
                <FaLock className="mr-2" />
                <span>Lock In</span>
              </button>
            </div>
            
            <div className="relative">
              <button className="flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                {profile?.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName || user?.email || 'User'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
