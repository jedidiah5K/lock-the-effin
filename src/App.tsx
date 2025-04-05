import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Calendar from './pages/Calendar';
import Money from './pages/Money';
import Settings from './pages/Settings';
import NotePage from './pages/NotePage';
import Todo from './pages/Todo';
import Habits from './pages/Habits';

// Components
import ResponsiveLayout from './components/layout/ResponsiveLayout';
import LoadingScreen from './components/ui/LoadingScreen';

// Styles
import './styles/App.css';

const App: React.FC = () => {
  const { user, loading, initialized } = useAuthStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check user's theme preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="app-container h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            {user ? (
              <ResponsiveLayout toggleTheme={toggleTheme} theme={theme}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notes/:id" element={<NotePage />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/money" element={<Money />} />
                  <Route path="/todo" element={<Todo />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ResponsiveLayout>
            ) : (
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
