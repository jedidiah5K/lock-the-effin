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
import { useHabitStore } from '../store/habitStore';
import HabitForm from '../components/habits/HabitForm';
import HabitDetails from '../components/habits/HabitDetails';
import HabitCard from '../components/habits/HabitCard';
import HabitStats from '../components/habits/HabitStats';

const Habits: React.FC = () => {
  const { 
    habits, 
    fetchHabits,
    toggleHabitCompletion,
    deleteHabit,
    loading, 
    error 
  } = useHabitStore();
  
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState<'habits' | 'stats'>('habits');
  
  // Fetch data on component mount
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);
  
  // Handle add habit
  const handleAddHabit = () => {
    setEditingHabitId(null);
    setShowHabitForm(true);
  };
  
  // Handle edit habit
  const handleEditHabit = (habitId: string) => {
    setEditingHabitId(habitId);
    setShowHabitForm(true);
  };
  
  // Handle view habit details
  const handleViewHabitDetails = (habitId: string) => {
    setSelectedHabitId(habitId);
  };
  
  // Handle track habit
  const handleTrackHabit = async (habitId: string, completed: boolean, date?: Date) => {
    const today = date || new Date();
    try {
      await toggleHabitCompletion(habitId, today, completed ? "Completed" : undefined);
      fetchHabits(); // Refresh habits after tracking
    } catch (error) {
      console.error('Error tracking habit:', error);
    }
  };
  
  // Handle delete habit
  const handleDeleteHabit = async () => {
    setSelectedHabitId(null);
    fetchHabits(); // Refresh habits after deletion
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    setShowHabitForm(false);
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
              
              <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setView('grid')}
                  className={`px-3 py-2 ${view === 'grid' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                >
                  Grid
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={`px-3 py-2 ${view === 'list' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
                >
                  List
                </button>
              </div>
            </>
          )}
          
          <button
            onClick={handleAddHabit}
            className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <FaPlus className="mr-2" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'habits'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <FaLeaf className="inline mr-2" />
          My Habits
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium text-sm border-b-2 ${
            activeTab === 'stats'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <FaChartLine className="inline mr-2" />
          Statistics
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center">
          <FaExclamationCircle className="mr-2" />
          {error}
        </div>
      )}
      
      {activeTab === 'habits' ? (
        <>
          {loading && habits.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading habits...</p>
              </div>
            </div>
          ) : filteredHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FaLeaf className="text-4xl text-slate-400 mb-4" />
              <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No habits found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                {filter === 'all' 
                  ? "You haven't created any habits yet. Start building better routines by adding your first habit."
                  : filter === 'active'
                  ? "You don't have any active habits. Unarchive some habits or create new ones."
                  : "You don't have any archived habits."}
              </p>
              {filter !== 'archived' && (
                <button
                  onClick={handleAddHabit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <FaPlus className="mr-2" />
                  <span>Add Your First Habit</span>
                </button>
              )}
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredHabits.map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onView={handleViewHabitDetails}
                  onTrack={handleTrackHabit}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <HabitStats />
      )}
      
      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habitId={editingHabitId}
          onClose={() => {
            setShowHabitForm(false);
            setEditingHabitId(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
      
      {/* Habit Details Modal */}
      {selectedHabitId && (
        <HabitDetails
          habitId={selectedHabitId}
          onClose={() => setSelectedHabitId(null)}
          onEdit={() => {
            setEditingHabitId(selectedHabitId);
            setSelectedHabitId(null);
            setShowHabitForm(true);
          }}
          onDelete={handleDeleteHabit}
          onTrack={handleTrackHabit}
        />
      )}
    </div>
  );
};

export default Habits;
