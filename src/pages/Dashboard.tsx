import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBook, FaMoneyBillWave, FaChartLine, FaLock, FaStar, FaListUl, FaCheck, FaLeaf } from 'react-icons/fa';
import { useAuthStore } from '../store/authStore';
import { useNotesStore } from '../store/notesStore';
import { useCalendarStore } from '../store/calendarStore';
import { useMoneyStore } from '../store/moneyStore';
import { useTodoStore } from '../store/todoStore';
import { useHabitStore } from '../store/habitStore';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { notes, fetchNotes } = useNotesStore();
  const { events, fetchEvents } = useCalendarStore();
  const { transactions, fetchTransactions, getBalance, getSpendingByCategory } = useMoneyStore();
  const { todoItems, fetchTodoItems, getTodaysTasks, toggleTodoCompletion } = useTodoStore();
  const { habits, fetchHabits, toggleHabitCompletion } = useHabitStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Fetch data
    fetchNotes();
    fetchEvents();
    fetchTransactions();
    fetchTodoItems();
    fetchHabits();
  }, [fetchNotes, fetchEvents, fetchTransactions, fetchTodoItems, fetchHabits]);

  // Get today's events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todaysEvents = events.filter(
    event => new Date(event.start) >= today && new Date(event.start) < tomorrow
  ).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // Get recent notes
  const recentNotes = [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 3);

  // Get recent transactions
  const recentTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 3);

  // Current balance
  const balance = getBalance();

  // Get today's habits
  const getTodaysHabits = () => {
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
    
    return habits
      .filter(habit => !habit.archived && habit.frequency[daysMap[dayOfWeek]])
      .sort((a, b) => {
        // Sort by completion status (incomplete first)
        const aCompleted = isHabitCompletedToday(a);
        const bCompleted = isHabitCompletedToday(b);
        if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
        
        // Then sort by name
        return a.name.localeCompare(b.name);
      });
  };
  
  // Check if habit was completed today
  const isHabitCompletedToday = (habit: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return habit.entries?.some((entry: any) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime() && entry.completed;
    }) || false;
  };
  
  // Handle habit completion toggle
  const handleToggleHabit = async (habitId: string) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;
      
      const completed = !isHabitCompletedToday(habit);
      await toggleHabitCompletion(habitId, new Date(), completed ? "Completed from Dashboard" : undefined);
      fetchHabits(); // Refresh habits after toggling
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  return (
    <div className="dashboard p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          {greeting}, {profile?.displayName || user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link to="/notes/new" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center">
          <FaBook className="text-3xl text-indigo-600 mb-2" />
          <span className="font-medium">New Note</span>
        </Link>
        <Link to="/calendar" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center">
          <FaCalendarAlt className="text-3xl text-pink-500 mb-2" />
          <span className="font-medium">Add Event</span>
        </Link>
        <Link to="/todo" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center">
          <FaListUl className="text-3xl text-amber-500 mb-2" />
          <span className="font-medium">Add Task</span>
        </Link>
        <Link to="/habits" className="card hover:shadow-md transition-shadow flex flex-col items-center justify-center p-6 text-center">
          <FaLeaf className="text-3xl text-emerald-500 mb-2" />
          <span className="font-medium">Track Habit</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Schedule */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Schedule</h2>
            <Link to="/calendar" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          
          {todaysEvents.length > 0 ? (
            <div className="space-y-3">
              {todaysEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-start p-3 rounded-lg border-l-4"
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {event.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.location && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-500 dark:text-slate-400">No events scheduled for today</p>
              <Link to="/calendar" className="btn-outline text-sm mt-2 inline-block">
                Add Event
              </Link>
            </div>
          )}
        </div>

        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Tasks</h2>
            <Link to="/todo" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          
          {getTodaysTasks().length > 0 ? (
            <div className="space-y-3">
              {getTodaysTasks().map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <button
                    onClick={() => toggleTodoCompletion(task.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.completed && <FaCheck className="text-xs" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Due: {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  {task.priority === 'high' && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                      High
                    </span>
                  )}
                  {task.priority === 'urgent' && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <FaListUl className="mx-auto text-2xl mb-2 opacity-50" />
              <p>No tasks for today</p>
              <Link to="/todo" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Add a task
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Habits */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Habits</h2>
            <Link to="/habits" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          
          {getTodaysHabits().length > 0 ? (
            <div className="space-y-3">
              {getTodaysHabits().map((habit) => (
                <div 
                  key={habit.id}
                  className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div 
                    className="w-1 h-10 rounded-full mr-3 flex-shrink-0" 
                    style={{ backgroundColor: habit.color }}
                  />
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      isHabitCompletedToday(habit) 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isHabitCompletedToday(habit) && <FaCheck className="text-xs" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${
                      isHabitCompletedToday(habit) ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                    }`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {habit.description}
                      </p>
                    )}
                  </div>
                  {habit.locked && (
                    <FaLock className="ml-2 text-amber-500" title="Locked in" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <FaLeaf className="mx-auto text-2xl mb-2 opacity-50" />
              <p>No habits scheduled for today</p>
              <Link to="/habits" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Add a habit
              </Link>
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Notes</h2>
            <Link to="/notes" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          
          {recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link 
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="block p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <h3 className="font-medium text-slate-900 dark:text-white truncate">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                    {note.preview || 'No content'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <FaBook className="mx-auto text-2xl mb-2 opacity-50" />
              <p>No notes yet</p>
              <Link to="/notes/new" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Create your first note
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Financial Overview</h2>
            <Link to="/money" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              View All
            </Link>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-600 dark:text-slate-400">Current Balance</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recent Transactions</p>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              <FaMoneyBillWave className="mx-auto text-2xl mb-2 opacity-50" />
              <p>No transactions yet</p>
              <Link to="/money" className="inline-block mt-2 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Add a transaction
              </Link>
            </div>
          )}
        </div>
        
        {/* Productivity Stats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Productivity Stats</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {getTodaysTasks().filter(task => task.completed).length}/{getTodaysTasks().length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Tasks Completed</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {getTodaysHabits().filter(habit => isHabitCompletedToday(habit)).length}/{getTodaysHabits().length}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Habits Tracked</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <p className="font-medium text-slate-900 dark:text-white mb-2">Productivity Tips</p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-start">
                <FaStar className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Complete your most important task first thing in the morning.</span>
              </li>
              <li className="flex items-start">
                <FaStar className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Take short breaks every 25-30 minutes to maintain focus.</span>
              </li>
              <li className="flex items-start">
                <FaStar className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Track your habits consistently to build lasting routines.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
