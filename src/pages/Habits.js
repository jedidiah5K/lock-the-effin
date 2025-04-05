import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaLeaf, 
  FaCalendarAlt, 
  FaFilter, 
  FaEllipsisH,
  FaCheck,
  FaTrash,
  FaEdit,
  FaChartLine,
  FaExclamationCircle,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useHabitStore } from '../store/habitStore.js';
import HabitForm from '../components/habits/HabitForm';
import HabitDetails from '../components/habits/HabitDetails';
import HabitCard from '../components/habits/HabitCard';
import HabitStats from '../components/habits/HabitStats';

const Habits = () => {
  const { habits, fetchHabits, createHabit, updateHabit, deleteHabit, toggleHabitCompletion } = useHabitStore();
  const [activeTab, setActiveTab] = useState('habits');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showStats, setShowStats] = useState(false);
  
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);
  
  const handleHabitClick = (habit) => {
    setSelectedHabit(habit);
  };
  
  const handleCloseDetails = () => {
    setSelectedHabit(null);
  };
  
  const handleEditHabit = (habit) => {
    setEditingHabitId(habit.id);
    setShowForm(true);
  };
  
  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId);
      if (selectedHabit && selectedHabit.id === habitId) {
        setSelectedHabit(null);
      }
    }
  };
  
  const handleToggleCompletion = async (habitId, date) => {
    await toggleHabitCompletion(habitId, date);
  };
  
  const handleShowStats = (habit) => {
    setSelectedHabit(habit);
    setShowStats(true);
  };
  
  const handleCloseStats = () => {
    setShowStats(false);
  };
  
  const handleFormSubmit = async (habitData) => {
    if (editingHabitId) {
      await updateHabit(editingHabitId, habitData);
    } else {
      await createHabit(habitData);
    }
    setShowForm(false);
    setEditingHabitId(null);
    fetchHabits(); // Refresh habits after creating/editing
  };
  
  // Get filtered habits
  const getFilteredHabits = () => {
    switch (filter) {
      case 'active':
        return habits.filter(habit => !habit.archived);
      case 'archived':
        return habits.filter(habit => habit.archived);
      default:
        return habits;
    }
  };
  
  const filteredHabits = getFilteredHabits();
  
  return (
    <div className="habits-page p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Habits</h1>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'habits' && (
            <>
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 ${filter === 'all' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('active')}
                  className={`px-3 py-2 ${filter === 'active' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setFilter('archived')}
                  className={`px-3 py-2 ${filter === 'archived' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                >
                  Archived
                </button>
              </div>
              
              <button 
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center"
              >
                <FaPlus className="mr-1" /> New Habit
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'habits'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('habits')}
        >
          <FaLeaf className="inline mr-2" />
          Habits
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          <FaCalendarAlt className="inline mr-2" />
          Calendar
        </button>
      </div>
      
      {/* Content */}
      <div className="habits-content">
        {activeTab === 'habits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHabits.length === 0 ? (
              <div className="col-span-full p-6 text-center bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <FaExclamationCircle className="mx-auto text-4xl text-slate-400 mb-2" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No habits found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {filter === 'all' 
                    ? "You haven't created any habits yet." 
                    : filter === 'active' 
                      ? "You don't have any active habits." 
                      : "You don't have any archived habits."}
                </p>
                {filter !== 'archived' && (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="btn-primary inline-flex items-center"
                  >
                    <FaPlus className="mr-1" /> Create your first habit
                  </button>
                )}
              </div>
            ) : (
              filteredHabits.map(habit => (
                <HabitCard 
                  key={habit.id}
                  habit={habit}
                  onHabitClick={handleHabitClick}
                  onEdit={handleEditHabit}
                  onDelete={handleDeleteHabit}
                  onToggleCompletion={handleToggleCompletion}
                  onShowStats={handleShowStats}
                />
              ))
            )}
          </div>
        )}
        
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
            <p className="text-center text-slate-500 dark:text-slate-400">
              Calendar view coming soon...
            </p>
          </div>
        )}
      </div>
      
      {/* Habit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingHabitId ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingHabitId(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <HabitForm 
                onSubmit={handleFormSubmit}
                initialData={editingHabitId ? habits.find(h => h.id === editingHabitId) : null}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Habit Details Modal */}
      {selectedHabit && !showStats && (
        <HabitDetails 
          habit={selectedHabit}
          onClose={handleCloseDetails}
          onEdit={handleEditHabit}
          onDelete={handleDeleteHabit}
          onToggleCompletion={handleToggleCompletion}
          onShowStats={handleShowStats}
        />
      )}
      
      {/* Habit Stats Modal */}
      {selectedHabit && showStats && (
        <HabitStats 
          habit={selectedHabit}
          onClose={handleCloseStats}
          onBack={() => {
            setShowStats(false);
          }}
        />
      )}
    </div>
  );
};

export default Habits;
