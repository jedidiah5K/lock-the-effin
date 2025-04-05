import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface HabitStreakProps {
  habit: any;
  maxDays?: number;
}

const HabitStreak: React.FC<HabitStreakProps> = ({ habit, maxDays = 7 }) => {
  // Get days to display
  const getDaysToDisplay = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < maxDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.unshift(date); // Add to beginning of array to show oldest first
    }
    
    return days;
  };
  
  // Check if habit should be tracked on a specific date
  const shouldTrackOnDate = (date: Date) => {
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
  const wasTrackedOnDate = (date: Date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return habit.entries.some((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === targetDate.getTime() && entry.completed;
    });
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'short' }).substring(0, 1);
  };
  
  const daysToDisplay = getDaysToDisplay();
  
  return (
    <div className="flex justify-between">
      {daysToDisplay.map((date, index) => {
        const isTracked = wasTrackedOnDate(date);
        const shouldTrack = shouldTrackOnDate(date);
        const isToday = new Date().toDateString() === date.toDateString();
        
        // Determine status and style
        let status: 'completed' | 'missed' | 'not-scheduled' | 'upcoming' = 'not-scheduled';
        
        if (shouldTrack) {
          if (isTracked) {
            status = 'completed';
          } else if (date <= new Date()) {
            status = 'missed';
          } else {
            status = 'upcoming';
          }
        }
        
        return (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {formatDate(date)}
            </div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isToday ? 'ring-2 ring-indigo-300 dark:ring-indigo-700' : ''
              } ${
                status === 'completed' 
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : status === 'missed'
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : status === 'upcoming'
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
            >
              {status === 'completed' && <FaCheck className="text-xs" />}
              {status === 'missed' && <FaTimes className="text-xs" />}
              {status === 'not-scheduled' && <span className="text-xs">-</span>}
              {status === 'upcoming' && <span className="text-xs">·</span>}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitStreak;
