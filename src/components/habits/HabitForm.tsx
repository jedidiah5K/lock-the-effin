import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaCalendarAlt, 
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useHabitStore } from '../../store/habitStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface HabitFormProps {
  onClose: () => void;
  onSuccess: () => void;
  habitId?: string | null;
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

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
];

const HabitForm: React.FC<HabitFormProps> = ({ onClose, onSuccess, habitId }) => {
  const { 
    createHabit, 
    updateHabit, 
    fetchHabit, 
    selectedHabit, 
    loading, 
    error 
  } = useHabitStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [frequency, setFrequency] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  });
  const [locked, setLocked] = useState(false);
  const [archived, setArchived] = useState(false);
  
  // Fetch habit data if editing
  useEffect(() => {
    if (habitId) {
      fetchHabit(habitId);
    }
  }, [habitId, fetchHabit]);
  
  // Populate form with habit data if editing
  useEffect(() => {
    if (selectedHabit) {
      setName(selectedHabit.name);
      setDescription(selectedHabit.description || '');
      setColor(selectedHabit.color);
      setStartDate(new Date(selectedHabit.startDate));
      setEndDate(selectedHabit.endDate ? new Date(selectedHabit.endDate) : null);
      setFrequency(selectedHabit.frequency);
      setLocked(selectedHabit.locked || false);
      setArchived(selectedHabit.archived || false);
    }
  }, [selectedHabit]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    try {
      const habitData = {
        name,
        description: description || undefined,
        color,
        startDate,
        endDate,
        frequency,
        locked,
        archived
      };
      
      if (habitId && selectedHabit) {
        await updateHabit(habitId, habitData);
      } else {
        await createHabit(habitData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };
  
  // Toggle day in frequency
  const toggleDay = (day: string) => {
    setFrequency(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  // Check if any day is selected
  const isAnyDaySelected = Object.values(frequency).some(value => value);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {habitId ? 'Edit Habit' : 'Create Habit'}
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Habit Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                placeholder="Read for 30 minutes"
                required
              />
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
                placeholder="Add details about this habit"
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
            
            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date) => setStartDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
            
            {/* End Date (Optional) */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                End Date (Optional)
              </label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  minDate={startDate}
                  isClearable
                  placeholderText="No end date"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
            
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Repeat on
              </label>
              <div className="flex space-x-1">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      frequency[day.key]
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                    onClick={() => toggleDay(day.key)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {!isAnyDaySelected && (
                <p className="mt-1 text-xs text-red-500">
                  Please select at least one day
                </p>
              )}
            </div>
            
            {/* Lock In */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="locked"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="locked" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Lock in this habit (can't be deleted once locked)
              </label>
            </div>
            
            {/* Archive */}
            {habitId && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="archived"
                  checked={archived}
                  onChange={(e) => setArchived(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="archived" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Archive this habit
                </label>
              </div>
            )}
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
              disabled={loading || !name.trim() || !isAnyDaySelected}
            >
              {loading ? 'Saving...' : habitId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;
