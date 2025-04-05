import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBook, FaMoneyBillWave, FaChartLine, FaLock, FaStar, FaListUl, FaCheck, FaLeaf } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore.js';
import { useNotesStore } from '../store/notesStore';
import { useCalendarStore } from '../store/calendarStore';
import { useMoneyStore } from '../store/moneyStore';
import { useTodoStore } from '../store/todoStore';
import { useHabitStore } from '../store/habitStore.js';

const Dashboard = () => {
  const { user, profile } = useAuthStore();
  const { notes, fetchNotes } = useNotesStore();
  const { events, fetchEvents } = useCalendarStore();
  const { transactions, fetchTransactions, getBalance, getSpendingByCategory } = useMoneyStore();
  const { todoItems, fetchTodoItems, getTodaysTasks, toggleTodoCompletion } = useTodoStore();
  const { habits, fetchHabits, toggleHabitCompletion } = useHabitStore();
  
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [balance, setBalance] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [streakHabits, setStreakHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        await Promise.all([
          fetchNotes(),
          fetchEvents(),
          fetchTransactions(),
          fetchTodoItems(),
          fetchHabits()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [fetchNotes, fetchEvents, fetchTransactions, fetchTodoItems, fetchHabits]);
  
  useEffect(() => {
    if (todoItems.length > 0) {
      setTodaysTasks(getTodaysTasks().slice(0, 5));
    }
    
    if (transactions.length > 0) {
      setBalance(getBalance());
      setTopCategories(getSpendingByCategory().slice(0, 3));
    }
    
    if (events.length > 0) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcoming = events
        .filter(event => {
          const eventDate = new Date(event.start);
          return eventDate >= today && eventDate <= nextWeek;
        })
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 3);
      
      setUpcomingEvents(upcoming);
    }
    
    if (notes.length > 0) {
      const recent = [...notes]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);
      
      setRecentNotes(recent);
    }
    
    if (habits.length > 0) {
      const withStreaks = habits
        .filter(habit => habit.currentStreak > 0)
        .sort((a, b) => b.currentStreak - a.currentStreak)
        .slice(0, 3);
      
      setStreakHabits(withStreaks);
    }
  }, [todoItems, transactions, events, notes, habits, getTodaysTasks, getBalance, getSpendingByCategory]);
  
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="dashboard p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back, {profile?.displayName || user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's an overview of your productivity and goals
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Today's Tasks</h3>
            <FaListUl className="text-indigo-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 dark:text-white mr-2">
              {todaysTasks.length}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              tasks remaining
            </span>
          </div>
          <Link to="/todo" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
            View all tasks
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Balance</h3>
            <FaMoneyBillWave className="text-green-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 dark:text-white mr-2">
              {formatCurrency(balance)}
            </span>
          </div>
          <Link to="/money" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
            Manage finances
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Upcoming Events</h3>
            <FaCalendarAlt className="text-orange-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 dark:text-white mr-2">
              {upcomingEvents.length}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              this week
            </span>
          </div>
          <Link to="/calendar" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
            View calendar
          </Link>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Habit Streaks</h3>
            <FaLeaf className="text-emerald-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-900 dark:text-white mr-2">
              {streakHabits.length > 0 
                ? streakHabits[0]?.currentStreak || 0 
                : 0}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              days best streak
            </span>
          </div>
          <Link to="/habits" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
            View habits
          </Link>
        </div>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
              <Link to="/todo" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            {todaysTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No tasks for today</p>
                <Link to="/todo" className="btn-primary mt-2 inline-flex items-center text-sm">
                  <FaPlus className="mr-1" /> Add Task
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {todaysTasks.map(task => (
                  <li key={task.id} className="py-2">
                    <div className="flex items-start">
                      <button 
                        onClick={() => toggleTodoCompletion(task.id)}
                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border ${
                          task.completed 
                            ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {task.completed && <FaCheck className="text-white text-xs" />}
                      </button>
                      <div className="ml-3 flex-1">
                        <p className={`text-sm ${
                          task.completed 
                            ? 'line-through text-slate-400 dark:text-slate-500' 
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        {task.priority === 'high' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Recent Notes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Notes</h2>
              <Link to="/notes" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            {recentNotes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No notes yet</p>
                <Link to="/notes" className="btn-primary mt-2 inline-flex items-center text-sm">
                  <FaPlus className="mr-1" /> Add Note
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentNotes.map(note => (
                  <Link 
                    key={note.id} 
                    to={`/notes/${note.id}`}
                    className="block p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {note.content.replace(/<[^>]*>/g, '') || 'No content'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
              <Link to="/calendar" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No upcoming events</p>
                <Link to="/calendar" className="btn-primary mt-2 inline-flex items-center text-sm">
                  <FaPlus className="mr-1" /> Add Event
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {upcomingEvents.map(event => (
                  <li key={event.id} className="py-3">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <FaCalendarAlt />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {event.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatDate(event.start)}
                          {event.allDay ? ' (All day)' : ''}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Top Spending Categories */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Spending</h2>
              <Link to="/money" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            {topCategories.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No spending data yet</p>
                <Link to="/money" className="btn-primary mt-2 inline-flex items-center text-sm">
                  <FaPlus className="mr-1" /> Add Transaction
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {topCategories.map(category => (
                  <li key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                        {category.category}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Habit Streaks */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Habit Streaks</h2>
              <Link to="/habits" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>
            
            {streakHabits.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400">No active habit streaks</p>
                <Link to="/habits" className="btn-primary mt-2 inline-flex items-center text-sm">
                  <FaPlus className="mr-1" /> Create Habit
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {streakHabits.map(habit => (
                  <li key={habit.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaLeaf className="text-emerald-500 mr-2" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                        <FaFire className="text-orange-500 mr-1" />
                        <span className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                          {habit.currentStreak} day{habit.currentStreak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
