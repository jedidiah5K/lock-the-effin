import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaChevronLeft, 
  FaChevronRight, 
  FaCalendarAlt, 
  FaListUl,
  FaEllipsisH,
  FaLink,
  FaMoneyBillWave,
  FaBook,
  FaCheck
} from 'react-icons/fa';
import { useCalendarStore } from '../store/calendarStore';
import { useNotesStore } from '../store/notesStore';
import { useMoneyStore } from '../store/moneyStore';
import { useTodoStore } from '../store/todoStore';
import EventForm from '../components/calendar/EventForm';
import EventDetails from '../components/calendar/EventDetails';

// Days of the week
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Month names
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Calendar: React.FC = () => {
  const { 
    events, 
    fetchEvents, 
    selectedDate, 
    setSelectedDate, 
    view, 
    setView,
    loading, 
    error 
  } = useCalendarStore();
  
  const { fetchNotes } = useNotesStore();
  const { fetchTransactions } = useMoneyStore();
  const { fetchTodoItems, getTodaysTasks } = useTodoStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchEvents();
    fetchNotes();
    fetchTransactions();
    fetchTodoItems();
  }, [fetchEvents, fetchNotes, fetchTransactions, fetchTodoItems]);
  
  // Update today's tasks when todo items change
  useEffect(() => {
    setTodaysTasks(getTodaysTasks());
  }, [getTodaysTasks]);
  
  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Previous month days to display
    const previousMonthDays = [];
    if (startingDayOfWeek > 0) {
      const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        previousMonthDays.push({
          date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
          isCurrentMonth: false
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days to display
    const nextMonthDays = [];
    const totalDaysDisplayed = previousMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysDisplayed; // 6 rows of 7 days
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === day.getTime();
    });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Navigate to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDate(today);
  };
  
  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Format time (12-hour format)
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Generate days for the week view
  const generateWeekDays = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start from Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    
    return days;
  };
  
  // Generate hours for the day view
  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };
  
  // Get events for a specific hour
  const getEventsForHour = (date: Date, hour: number) => {
    const day = new Date(date);
    day.setHours(hour, 0, 0, 0);
    
    return events.filter(event => {
      const eventStart = new Date(event.start);
      return eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear() &&
        eventStart.getHours() === hour;
    });
  };
  
  // Calendar days
  const calendarDays = generateCalendarDays();
  
  // Week days
  const weekDays = generateWeekDays();
  
  // Hours
  const hours = generateHours();
  
  return (
    <div className="calendar-page p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="btn-outline py-2 px-3"
          >
            Today
          </button>
          
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-2 ${view === 'month' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
              aria-label="Month view"
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-2 ${view === 'week' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
              aria-label="Week view"
            >
              Week
            </button>
            <button 
              onClick={() => setView('day')}
              className={`px-3 py-2 ${view === 'day' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-white dark:bg-slate-800'}`}
              aria-label="Day view"
            >
              Day
            </button>
          </div>
          
          <button 
            onClick={() => setShowEventForm(true)}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <FaPlus className="mr-2" />
            <span>Add Event</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                aria-label="Previous month"
              >
                <FaChevronLeft />
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mx-4">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                aria-label="Next month"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
          
          {/* Month View */}
          {view === 'month' && (
            <div className="calendar-grid">
              {/* Day names */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 grid-rows-6 h-[calc(100vh-300px)]">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDay(day.date);
                  const isSelected = selectedDate.getDate() === day.date.getDate() &&
                    selectedDate.getMonth() === day.date.getMonth() &&
                    selectedDate.getFullYear() === day.date.getFullYear();
                  
                  return (
                    <div 
                      key={index}
                      className={`border-b border-r border-slate-200 dark:border-slate-700 p-1 ${
                        !day.isCurrentMonth ? 'bg-slate-50 dark:bg-slate-850' : ''
                      } ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                      onClick={() => handleDayClick(day.date)}
                    >
                      <div className={`flex justify-between items-center p-1 ${
                        isToday(day.date) ? 'bg-indigo-100 dark:bg-indigo-900/30 rounded-full' : ''
                      }`}>
                        <span className={`text-sm font-medium ${
                          !day.isCurrentMonth ? 'text-slate-400 dark:text-slate-500' : 
                          isToday(day.date) ? 'text-indigo-600 dark:text-indigo-400' : 
                          'text-slate-700 dark:text-slate-300'
                        }`}>
                          {day.date.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <span className="text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 rounded-full px-1.5">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Events */}
                      <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                        {dayEvents.slice(0, 3).map(event => (
                          <div 
                            key={event.id}
                            className="text-xs p-1 rounded truncate cursor-pointer"
                            style={{ backgroundColor: `${event.color}20`, color: event.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event.id);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Week View */}
          {view === 'week' && (
            <div className="week-view">
              {/* Day names */}
              <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
                <div className="p-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700">
                  Time
                </div>
                {weekDays.map((day, index) => {
                  const isCurrentDay = isToday(day);
                  const isSelectedDay = selectedDate.getDate() === day.getDate() &&
                    selectedDate.getMonth() === day.getMonth() &&
                    selectedDate.getFullYear() === day.getFullYear();
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-2 text-center ${
                        isCurrentDay ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      } ${isSelectedDay ? 'border-t-2 border-indigo-500' : ''}`}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {DAYS_OF_WEEK[day.getDay()].substring(0, 3)}
                      </div>
                      <div className={`text-lg font-semibold ${
                        isCurrentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Week hours */}
              <div className="grid grid-cols-8 h-[calc(100vh-350px)] overflow-y-auto">
                {/* Time slots */}
                <div className="border-r border-slate-200 dark:border-slate-700">
                  {hours.map(hour => (
                    <div 
                      key={hour} 
                      className="h-20 border-b border-slate-200 dark:border-slate-700 p-1 text-right pr-2"
                    >
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Days */}
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="relative">
                    {hours.map(hour => {
                      const hourEvents = getEventsForHour(day, hour);
                      
                      return (
                        <div 
                          key={hour} 
                          className="h-20 border-b border-r border-slate-200 dark:border-slate-700 p-1"
                        >
                          {hourEvents.map(event => (
                            <div 
                              key={event.id}
                              className="text-xs p-1 rounded mb-1 cursor-pointer"
                              style={{ backgroundColor: `${event.color}20`, color: event.color }}
                              onClick={() => setSelectedEvent(event.id)}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-xs opacity-80">
                                {formatTime(new Date(event.start))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Day View */}
          {view === 'day' && (
            <div className="day-view">
              {/* Day header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {DAYS_OF_WEEK[selectedDate.getDay()]}, {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h3>
              </div>
              
              {/* Day hours */}
              <div className="grid grid-cols-1 h-[calc(100vh-350px)] overflow-y-auto">
                {hours.map(hour => {
                  const hourEvents = getEventsForHour(selectedDate, hour);
                  
                  return (
                    <div 
                      key={hour} 
                      className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-700"
                    >
                      <div className="col-span-1 p-2 text-right border-r border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                      </div>
                      <div className="col-span-5 min-h-20 p-2">
                        {hourEvents.map(event => (
                          <div 
                            key={event.id}
                            className="p-2 rounded mb-2 cursor-pointer"
                            style={{ backgroundColor: `${event.color}20`, color: event.color }}
                            onClick={() => setSelectedEvent(event.id)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm opacity-80">
                              {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                            </div>
                            {event.location && (
                              <div className="text-sm mt-1 opacity-80">
                                {event.location}
                              </div>
                            )}
                            <div className="flex mt-2 space-x-2">
                              {event.noteId && (
                                <div className="flex items-center text-xs">
                                  <FaBook className="mr-1" /> Note
                                </div>
                              )}
                              {event.expenseId && (
                                <div className="flex items-center text-xs">
                                  <FaMoneyBillWave className="mr-1" /> Expense
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Today's Tasks */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
          <FaListUl className="mr-2 text-indigo-600" />
          Today's Tasks
        </h2>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4">
          {todaysTasks.length === 0 ? (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              No tasks scheduled for today
            </div>
          ) : (
            <ul className="space-y-2">
              {todaysTasks.map(task => (
                <li 
                  key={task.id}
                  className="flex items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <button
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {task.completed && <FaCheck className="text-xs" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${
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
                  <div className="flex items-center">
                    {task.priority === 'high' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mr-2">
                        High
                      </span>
                    )}
                    {task.priority === 'urgent' && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mr-2">
                        Urgent
                      </span>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                      <FaEllipsisH />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm 
          onClose={() => setShowEventForm(false)} 
          onSuccess={() => {
            setShowEventForm(false);
            fetchEvents();
          }}
          selectedDate={selectedDate}
        />
      )}
      
      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetails 
          eventId={selectedEvent} 
          onClose={() => setSelectedEvent(null)}
          onEdit={() => {
            setSelectedEvent(null);
            setShowEventForm(true);
          }}
          onDelete={() => {
            setSelectedEvent(null);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
