import React, { useEffect, useState } from 'react';
import { 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaChartLine,
  FaCheck,
  FaLock,
  FaArchive,
  FaUnlock,
  FaExclamationCircle
} from 'react-icons/fa';
import { useHabitStore } from '../../store/habitStore';
import HabitStreak from './HabitStreak';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface HabitDetailsProps {
  habitId: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTrack: (habitId: string, completed: boolean, date?: Date) => Promise<void>;
}

const HabitDetails: React.FC<HabitDetailsProps> = ({ 
  habitId, 
  onClose, 
  onEdit, 
  onDelete,
  onTrack
}) => {
  const { 
    fetchHabit, 
    deleteHabit, 
    archiveHabit,
    lockHabit,
    selectedHabit,
    loading, 
    error 
  } = useHabitStore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Fetch habit data
  useEffect(() => {
    fetchHabit(habitId);
  }, [habitId, fetchHabit]);
  
  // Handle delete habit
  const handleDelete = async () => {
    if (!selectedHabit) return;
    
    try {
      await deleteHabit(selectedHabit.id);
      onDelete();
    } catch (error: any) {
      console.error('Error deleting habit:', error);
    }
  };
  
  // Handle archive habit
  const handleArchive = async () => {
    if (!selectedHabit) return;
    
    try {
      await archiveHabit(selectedHabit.id, !selectedHabit.archived);
      fetchHabit(habitId);
    } catch (error: any) {
      console.error('Error archiving habit:', error);
    }
  };
  
  // Handle lock habit
  const handleLock = async () => {
    if (!selectedHabit || selectedHabit.locked) return;
    
    try {
      await lockHabit(selectedHabit.id);
      fetchHabit(habitId);
    } catch (error: any) {
      console.error('Error locking habit:', error);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Check if habit should be tracked on a specific date
  const shouldTrackOnDate = (habit: any, date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const daysMap: Record<number, string> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    
    return habit.frequency[daysMap[dayOfWeek]];
  };
  
  // Check if habit was tracked on a specific date
  const wasTrackedOnDate = (habit: any, date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return habit.entries.some((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime() && entry.completed;
    });
  };
  
  // Get current streak
  const getCurrentStreak = (habit: any) => {
    if (!habit.entries || habit.entries.length === 0) return 0;
    
    const sortedEntries = [...habit.entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if the most recent entry is from today or yesterday
    const mostRecentEntry = new Date(sortedEntries[0].date);
    mostRecentEntry.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // If the most recent entry is not from today or yesterday, and it's not completed, return 0
    if (mostRecentEntry.getTime() < yesterday.getTime() && !sortedEntries[0].completed) {
      return 0;
    }
    
    // Count consecutive completed entries
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      if (!entry.completed) break;
      
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      // For the first entry, check if it's from today or yesterday
      if (i === 0) {
        if (entryDate.getTime() === today.getTime() || entryDate.getTime() === yesterday.getTime()) {
          streak++;
          continue;
        } else {
          break;
        }
      }
      
      // For subsequent entries, check if they are consecutive
      const prevEntryDate = new Date(sortedEntries[i - 1].date);
      prevEntryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(prevEntryDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Get longest streak
  const getLongestStreak = (habit: any) => {
    if (!habit.entries || habit.entries.length === 0) return 0;
    
    const sortedEntries = [...habit.entries]
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedEntries.length === 0) return 0;
    
    let currentStreak = 1;
    let longestStreak = 1;
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const prevDate = new Date(sortedEntries[i - 1].date);
      const currDate = new Date(sortedEntries[i].date);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(prevDate);
      expectedDate.setDate(expectedDate.getDate() + 1);
      
      if (currDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return longestStreak;
  };
  
  // Get completion rate
  const getCompletionRate = (habit: any) => {
    if (!habit.entries || habit.entries.length === 0) return 0;
    
    const completedEntries = habit.entries.filter((entry: any) => entry.completed);
    return Math.round((completedEntries.length / habit.entries.length) * 100);
  };
  
  // Get completion data for chart
  const getCompletionData = (habit: any) => {
    if (!habit.entries || habit.entries.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 0
          }
        ]
      };
    }
    
    const completedCount = habit.entries.filter((entry: any) => entry.completed).length;
    const missedCount = habit.entries.length - completedCount;
    
    return {
      labels: ['Completed', 'Missed'],
      datasets: [
        {
          data: [completedCount, missedCount],
          backgroundColor: [
            '#10b981', // Emerald for completed
            '#f43f5e'  // Rose for missed
          ],
          borderWidth: 0
        }
      ]
    };
  };
  
  // Get recent entries
  const getRecentEntries = (habit: any, count = 7) => {
    if (!habit.entries || habit.entries.length === 0) return [];
    
    return [...habit.entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, count);
  };
  
  if (!selectedHabit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-4">
          <p className="text-center text-slate-700 dark:text-slate-300">Loading habit details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Habit Details
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <FaTimes />
          </button>
        </div>
        
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="p-4">
          <div className="space-y-4">
            {/* Habit Name and Status */}
            <div className="flex items-start">
              <div 
                className="w-4 h-16 rounded-full mt-1 mr-3 flex-shrink-0" 
                style={{ backgroundColor: selectedHabit.color }}
              />
              <div>
                <div className="flex items-center">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {selectedHabit.name}
                  </h3>
                  {selectedHabit.locked && (
                    <FaLock className="ml-2 text-amber-500" title="Locked in" />
                  )}
                  {selectedHabit.archived && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                      Archived
                    </span>
                  )}
                </div>
                
                {selectedHabit.description && (
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {selectedHabit.description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Streak and Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {getCurrentStreak(selectedHabit)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Streak
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {getLongestStreak(selectedHabit)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Longest Streak
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {getCompletionRate(selectedHabit)}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Completion Rate
                </div>
              </div>
            </div>
            
            {/* Dates */}
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Started on
                </div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {formatDate(selectedHabit.startDate)}
                </div>
              </div>
              {selectedHabit.endDate && (
                <div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Ends on
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {formatDate(selectedHabit.endDate)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Frequency */}
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                Frequency
              </div>
              <div className="flex space-x-1">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                  <div
                    key={day}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      selectedHabit.frequency[day]
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                    }`}
                  >
                    {day.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Track Today */}
            {shouldTrackOnDate(selectedHabit, new Date()) && !selectedHabit.archived && (
              <div className="mt-6">
                <button
                  onClick={() => onTrack(selectedHabit.id, !wasTrackedOnDate(selectedHabit, new Date()))}
                  className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                    wasTrackedOnDate(selectedHabit, new Date())
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-indigo-600 text-white dark:bg-indigo-700'
                  }`}
                >
                  <FaCheck className="mr-2" />
                  <span>
                    {wasTrackedOnDate(selectedHabit, new Date()) 
                      ? 'Completed Today' 
                      : 'Mark as Complete for Today'
                    }
                  </span>
                </button>
              </div>
            )}
            
            {/* Completion Chart */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Completion Overview
              </h4>
              <div className="h-60 flex items-center justify-center">
                <Doughnut 
                  data={getCompletionData(selectedHabit)} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Recent Entries */}
            <div className="mt-6">
              <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Recent Activity
              </h4>
              {getRecentEntries(selectedHabit).length > 0 ? (
                <div className="space-y-2">
                  {getRecentEntries(selectedHabit).map((entry: any) => (
                    <div 
                      key={entry.id}
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                        entry.completed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {entry.completed ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatDate(entry.date)}
                        </div>
                        {entry.note && (
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {entry.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            {!selectedHabit.locked && !showConfirmDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <FaTrash className="inline mr-1" />
                Delete
              </button>
            )}
            
            {showConfirmDelete && (
              <>
                <div className="flex-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <FaExclamationCircle className="mr-1" /> Are you sure?
                </div>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Confirm Delete
                </button>
              </>
            )}
            
            {!showConfirmDelete && (
              <>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <FaArchive className="inline mr-1" />
                  {selectedHabit.archived ? 'Unarchive' : 'Archive'}
                </button>
                
                {!selectedHabit.locked && (
                  <button
                    onClick={handleLock}
                    className="px-4 py-2 border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    <FaLock className="inline mr-1" />
                    Lock In
                  </button>
                )}
                
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <FaEdit className="inline mr-1" />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitDetails;
