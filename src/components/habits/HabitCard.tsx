import React from 'react';
import { 
  FaCheck, 
  FaEllipsisH, 
  FaLock,
  FaArchive
} from 'react-icons/fa';
import HabitStreak from './HabitStreak';

interface HabitCardProps {
  habit: any;
  onView: (habitId: string) => void;
  onTrack: (habitId: string, completed: boolean) => Promise<void>;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, onView, onTrack }) => {
  // Check if habit was tracked today
  const isTrackedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habit.entries.some((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.completed;
    });
  };
  
  // Check if habit should be tracked today
  const shouldTrackToday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
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
  
  // Get current streak
  const getCurrentStreak = () => {
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
  
  const tracked = isTrackedToday();
  const shouldTrack = shouldTrackToday();
  const currentStreak = getCurrentStreak();
  
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border-l-4 ${
        habit.archived ? 'border-slate-400 dark:border-slate-600' : 'border-l-4'
      }`}
      style={{ borderLeftColor: habit.archived ? undefined : habit.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center">
            <h3 
              className="text-lg font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={() => onView(habit.id)}
            >
              {habit.name}
            </h3>
            {habit.locked && (
              <FaLock className="ml-2 text-amber-500" title="Locked in" />
            )}
            {habit.archived && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                Archived
              </span>
            )}
          </div>
          {habit.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {habit.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onView(habit.id)}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <FaEllipsisH />
        </button>
      </div>
      
      <div className="mb-4">
        <HabitStreak habit={habit} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentStreak > 0 ? (
              <>
                <span className="text-indigo-600 dark:text-indigo-400">{currentStreak}</span> day streak
              </>
            ) : (
              'No active streak'
            )}
          </div>
        </div>
        
        {shouldTrack && !habit.archived && (
          <button
            onClick={() => onTrack(habit.id, !tracked)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
              tracked
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-indigo-600 text-white dark:bg-indigo-700'
            }`}
          >
            {tracked ? (
              <>
                <FaCheck className="mr-1" />
                Completed
              </>
            ) : (
              'Complete Today'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
