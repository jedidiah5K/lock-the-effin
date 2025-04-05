import React from 'react';
import { FaLock } from 'react-icons/fa';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-50">
      <div className="relative">
        <FaLock className="text-6xl text-indigo-600 animate-pulse" />
        <div className="absolute -bottom-2 -right-2">
          <div className="w-4 h-4 bg-pink-500 rounded-full animate-ping" />
        </div>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-200">
        Lock The Eff In
      </h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Loading your productivity space...</p>
    </div>
  );
};

export default LoadingScreen;
