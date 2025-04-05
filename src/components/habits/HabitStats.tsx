import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaFire } from 'react-icons/fa';
import { useHabitStore } from '../../store/habitStore';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HabitStatsProps {
  timeRange?: 'week' | 'month' | 'year';
  showAllHabits?: boolean;
}

const HabitStats: React.FC<HabitStatsProps> = ({ 
  timeRange = 'month',
  showAllHabits = true
}) => {
  const { habits, fetchHabits, getHabitStreak, getCompletionRate } = useHabitStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>(timeRange);
  
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);
  
  // Get active habits (non-archived)
  const activeHabits = habits.filter(habit => !habit.archived);
  
  // Get top habits by streak
  const getTopHabitsByStreak = (count = 5) => {
    return [...activeHabits]
      .sort((a, b) => getHabitStreak(b.id) - getHabitStreak(a.id))
      .slice(0, count);
  };
  
  // Get top habits by completion rate
  const getTopHabitsByCompletionRate = (count = 5) => {
    const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
    
    return [...activeHabits]
      .sort((a, b) => getCompletionRate(b.id, days) - getCompletionRate(a.id, days))
      .slice(0, count);
  };
  
  // Get average completion rate for all habits
  const getAverageCompletionRate = () => {
    if (activeHabits.length === 0) return 0;
    
    const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
    const totalRate = activeHabits.reduce((sum, habit) => sum + getCompletionRate(habit.id, days), 0);
    return Math.round(totalRate / activeHabits.length);
  };
  
  // Get total number of habit completions
  const getTotalCompletions = () => {
    return activeHabits.reduce((sum, habit) => sum + (habit.entries?.filter(entry => entry.completed)?.length || 0), 0);
  };
  
  // Get longest streak across all habits
  const getLongestStreak = () => {
    if (activeHabits.length === 0) return 0;
    
    return Math.max(...activeHabits.map(habit => getHabitStreak(habit.id)));
  };
  
  // Prepare data for completion rate chart
  const getCompletionRateChartData = () => {
    const topHabits = getTopHabitsByCompletionRate(5);
    const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
    
    return {
      labels: topHabits.map(habit => habit.name),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: topHabits.map(habit => getCompletionRate(habit.id, days)),
          backgroundColor: topHabits.map(habit => habit.color || '#4f46e5'),
          borderWidth: 0,
        }
      ]
    };
  };
  
  // Prepare data for streak chart
  const getStreakChartData = () => {
    const topHabits = getTopHabitsByStreak(5);
    
    return {
      labels: topHabits.map(habit => habit.name),
      datasets: [
        {
          label: 'Current Streak (Days)',
          data: topHabits.map(habit => getHabitStreak(habit.id)),
          backgroundColor: topHabits.map(habit => habit.color || '#4f46e5'),
          borderWidth: 0,
        }
      ]
    };
  };
  
  // Prepare data for overall completion doughnut chart
  const getOverallCompletionData = () => {
    const completedCount = getTotalCompletions();
    const totalPossible = activeHabits.reduce((sum, habit) => sum + (habit.entries?.length || 0), 0);
    const missedCount = totalPossible - completedCount;
    
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
  
  return (
    <div className="habit-stats">
      {/* Time Range Selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <button
            onClick={() => setSelectedTimeRange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              selectedTimeRange === 'week'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedTimeRange('month')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTimeRange === 'month'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedTimeRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              selectedTimeRange === 'year'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FaChartLine className="text-indigo-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {getAverageCompletionRate()}%
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Average across all habits
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FaFire className="text-amber-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Longest Streak</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {getLongestStreak()}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Consecutive days
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FaCalendarAlt className="text-emerald-500 mr-2" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Total Completions</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {getTotalCompletions()}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Across all habits
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Completion Rate Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">
            Top Habits by Completion Rate
          </h3>
          <div className="h-64">
            {activeHabits.length > 0 ? (
              <Bar 
                data={getCompletionRateChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b'
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'
                      }
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b'
                      },
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">No habit data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Streak Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">
            Top Habits by Current Streak
          </h3>
          <div className="h-64">
            {activeHabits.length > 0 ? (
              <Bar 
                data={getStreakChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b'
                      },
                      grid: {
                        color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0'
                      }
                    },
                    x: {
                      ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#94a3b8' : '#64748b'
                      },
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">No habit data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overall Completion Doughnut Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">
          Overall Completion Rate
        </h3>
        <div className="h-64 flex items-center justify-center">
          {activeHabits.length > 0 && getTotalCompletions() > 0 ? (
            <div className="w-64">
              <Doughnut 
                data={getOverallCompletionData()}
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
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No habit data available</p>
          )}
        </div>
      </div>
      
      {/* Habit Performance Table */}
      {showAllHabits && activeHabits.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white p-4 border-b border-slate-200 dark:border-slate-700">
            All Habits Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Habit
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Streak
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Completions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {activeHabits.map(habit => {
                  const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 365;
                  const completionRate = getCompletionRate(habit.id, days);
                  const streak = getHabitStreak(habit.id);
                  const totalCompletions = habit.entries?.filter(entry => entry.completed)?.length || 0;
                  
                  return (
                    <tr key={habit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: habit.color }}
                          />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {habit.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`font-medium ${
                          streak > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {streak} days
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${completionRate}%`,
                                backgroundColor: completionRate > 70 
                                  ? '#10b981' // emerald
                                  : completionRate > 40 
                                  ? '#f59e0b' // amber
                                  : '#ef4444' // red
                              }}
                            />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-slate-700 dark:text-slate-300">
                        {totalCompletions}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitStats;
