import React from 'react';

const Notes = () => {
  return (
    <div className="notes-page p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">Notes</h1>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
        <p className="text-center text-slate-500 dark:text-slate-400">
          Notes component content will go here
        </p>
      </div>
    </div>
  );
};

export default Notes;
