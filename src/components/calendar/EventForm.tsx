import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaBook, FaMoneyBillWave, FaListUl } from 'react-icons/fa';
import { useCalendarStore } from '../../store/calendarStore';
import { useNotesStore } from '../../store/notesStore';
import { useMoneyStore } from '../../store/moneyStore';
import { useTodoStore } from '../../store/todoStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface EventFormProps {
  onClose: () => void;
  onSuccess: () => void;
  selectedDate: Date;
  eventId?: string;
}

const COLORS = [
  '#4f46e5', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#6b7280', // Gray
];

const EventForm: React.FC<EventFormProps> = ({ onClose, onSuccess, selectedDate, eventId }) => {
  const { createEvent, updateEvent, fetchEvent, selectedEvent } = useCalendarStore();
  const { notes, fetchNotes } = useNotesStore();
  const { transactions, fetchTransactions } = useMoneyStore();
  const { todoItems, fetchTodoItems } = useTodoStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(selectedDate);
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date(selectedDate);
    date.setHours(date.getHours() + 1);
    return date;
  });
  const [location, setLocation] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isAllDay, setIsAllDay] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState('weekly');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchNotes();
    fetchTransactions();
    fetchTodoItems();
    
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId, fetchNotes, fetchTransactions, fetchTodoItems, fetchEvent]);
  
  // Populate form with event data if editing
  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setDescription(selectedEvent.description || '');
      setStartDate(new Date(selectedEvent.start));
      setEndDate(new Date(selectedEvent.end));
      setLocation(selectedEvent.location || '');
      setColor(selectedEvent.color);
      setIsAllDay(selectedEvent.allDay || false);
      setIsRecurring(!!selectedEvent.recurrence);
      
      if (selectedEvent.recurrence) {
        setRecurrencePattern(selectedEvent.recurrence.pattern);
        setRecurrenceEndDate(selectedEvent.recurrence.endDate ? new Date(selectedEvent.recurrence.endDate) : null);
      }
      
      setSelectedNoteId(selectedEvent.noteId || null);
      setSelectedExpenseId(selectedEvent.expenseId || null);
      setSelectedTodoId(selectedEvent.todoId || null);
    }
  }, [selectedEvent]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (startDate > endDate) {
      setError('End date must be after start date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const eventData = {
        title,
        description,
        start: startDate,
        end: endDate,
        location,
        color,
        allDay: isAllDay,
        recurrence: isRecurring ? {
          pattern: recurrencePattern,
          endDate: recurrenceEndDate
        } : undefined,
        noteId: selectedNoteId,
        expenseId: selectedExpenseId,
        todoId: selectedTodoId
      };
      
      if (eventId && selectedEvent) {
        await updateEvent(eventId, eventData);
      } else {
        await createEvent(eventData);
      }
      
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle all day toggle
  const handleAllDayToggle = (checked: boolean) => {
    setIsAllDay(checked);
    
    if (checked) {
      // Set times to start and end of day
      const newStartDate = new Date(startDate);
      newStartDate.setHours(0, 0, 0, 0);
      setStartDate(newStartDate);
      
      const newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 59, 999);
      setEndDate(newEndDate);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {eventId ? 'Edit Event' : 'Create Event'}
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
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                placeholder="Add title"
                required
              />
            </div>
            
            {/* All Day Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allDay"
                checked={isAllDay}
                onChange={(e) => handleAllDayToggle(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="allDay" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                All day
              </label>
            </div>
            
            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Start
                </label>
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(date: Date) => setStartDate(date)}
                    showTimeSelect={!isAllDay}
                    dateFormat={isAllDay ? "MMMM d, yyyy" : "MMMM d, yyyy h:mm aa"}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  End
                </label>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={(date: Date) => setEndDate(date)}
                    showTimeSelect={!isAllDay}
                    dateFormat={isAllDay ? "MMMM d, yyyy" : "MMMM d, yyyy h:mm aa"}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    minDate={startDate}
                  />
                  <FaCalendarAlt className="absolute right-3 top-3 text-slate-400" />
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Add location"
                />
                <FaMapMarkerAlt className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                placeholder="Add description"
              />
            </div>
            
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Recurring Event */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Recurring event
                </label>
              </div>
              
              {isRecurring && (
                <div className="ml-6 space-y-3 mt-2">
                  <div>
                    <label htmlFor="recurrencePattern" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Repeat
                    </label>
                    <select
                      id="recurrencePattern"
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      End repeat (optional)
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={recurrenceEndDate}
                        onChange={(date: Date | null) => setRecurrenceEndDate(date)}
                        dateFormat="MMMM d, yyyy"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        minDate={endDate}
                        isClearable
                        placeholderText="Never"
                      />
                      <FaCalendarAlt className="absolute right-3 top-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Link to Note */}
            <div>
              <label htmlFor="noteId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaBook className="mr-1 text-indigo-500" />
                  Link to Note
                </div>
              </label>
              <select
                id="noteId"
                value={selectedNoteId || ''}
                onChange={(e) => setSelectedNoteId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">None</option>
                {notes.map(note => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Link to Expense */}
            <div>
              <label htmlFor="expenseId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-1 text-green-500" />
                  Link to Transaction
                </div>
              </label>
              <select
                id="expenseId"
                value={selectedExpenseId || ''}
                onChange={(e) => setSelectedExpenseId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">None</option>
                {transactions.map(transaction => (
                  <option key={transaction.id} value={transaction.id}>
                    {transaction.description || transaction.category} ({transaction.type === 'expense' ? '-' : '+'}{transaction.amount} {transaction.currency})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Link to Todo */}
            <div>
              <label htmlFor="todoId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaListUl className="mr-1 text-amber-500" />
                  Link to Task
                </div>
              </label>
              <select
                id="todoId"
                value={selectedTodoId || ''}
                onChange={(e) => setSelectedTodoId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">None</option>
                {todoItems.map(todo => (
                  <option key={todo.id} value={todo.id}>
                    {todo.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : eventId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
