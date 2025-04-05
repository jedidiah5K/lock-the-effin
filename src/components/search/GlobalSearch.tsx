import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaTimes, 
  FaBook, 
  FaCalendarAlt, 
  FaListUl, 
  FaLeaf, 
  FaMoneyBillWave 
} from 'react-icons/fa';
import { useNotesStore } from '../../store/notesStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useTodoStore } from '../../store/todoStore';
import { useHabitStore } from '../../store/habitStore';
import { useMoneyStore } from '../../store/moneyStore';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  preview?: string;
  type: 'note' | 'event' | 'task' | 'habit' | 'transaction';
  date?: Date;
  path: string;
  icon: React.ReactNode;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notes } = useNotesStore();
  const { events } = useCalendarStore();
  const { todoItems } = useTodoStore();
  const { habits } = useHabitStore();
  const { transactions } = useMoneyStore();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'events' | 'tasks' | 'habits' | 'transactions'>('all');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
      setActiveTab('all');
    }
  }, [isOpen]);
  
  // Perform search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Search in notes
    if (activeTab === 'all' || activeTab === 'notes') {
      notes.forEach(note => {
        if (
          note.title?.toLowerCase().includes(lowerQuery) || 
          note.content?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: note.id,
            title: note.title || 'Untitled Note',
            preview: note.content?.substring(0, 100) || '',
            type: 'note',
            date: new Date(note.updatedAt),
            path: `/notes/${note.id}`,
            icon: <FaBook className="text-indigo-500" />
          });
        }
      });
    }
    
    // Search in events
    if (activeTab === 'all' || activeTab === 'events') {
      events.forEach(event => {
        if (
          event.title?.toLowerCase().includes(lowerQuery) || 
          event.description?.toLowerCase().includes(lowerQuery) ||
          event.location?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: event.id,
            title: event.title || 'Untitled Event',
            preview: event.description || event.location || '',
            type: 'event',
            date: new Date(event.start),
            path: `/calendar?event=${event.id}`,
            icon: <FaCalendarAlt className="text-pink-500" />
          });
        }
      });
    }
    
    // Search in tasks
    if (activeTab === 'all' || activeTab === 'tasks') {
      todoItems.forEach(task => {
        if (
          task.title?.toLowerCase().includes(lowerQuery) || 
          task.description?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: task.id,
            title: task.title || 'Untitled Task',
            preview: task.description || '',
            type: 'task',
            date: task.dueDate ? new Date(task.dueDate) : undefined,
            path: `/todo?task=${task.id}`,
            icon: <FaListUl className="text-amber-500" />
          });
        }
      });
    }
    
    // Search in habits
    if (activeTab === 'all' || activeTab === 'habits') {
      habits.forEach(habit => {
        if (
          habit.name?.toLowerCase().includes(lowerQuery) || 
          habit.description?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: habit.id,
            title: habit.name || 'Untitled Habit',
            preview: habit.description || '',
            type: 'habit',
            date: new Date(habit.updatedAt),
            path: `/habits?habit=${habit.id}`,
            icon: <FaLeaf className="text-emerald-500" />
          });
        }
      });
    }
    
    // Search in transactions
    if (activeTab === 'all' || activeTab === 'transactions') {
      transactions.forEach(transaction => {
        if (
          transaction.description?.toLowerCase().includes(lowerQuery) || 
          transaction.category?.toLowerCase().includes(lowerQuery) ||
          transaction.notes?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            id: transaction.id,
            title: transaction.description || 'Untitled Transaction',
            preview: `${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)} - ${transaction.category}`,
            type: 'transaction',
            date: new Date(transaction.date),
            path: `/money?transaction=${transaction.id}`,
            icon: <FaMoneyBillWave className="text-cyan-500" />
          });
        }
      });
    }
    
    // Sort results by relevance and recency
    searchResults.sort((a, b) => {
      // First prioritize title matches
      const aTitleMatch = a.title.toLowerCase().includes(lowerQuery);
      const bTitleMatch = b.title.toLowerCase().includes(lowerQuery);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      // Then sort by date (most recent first)
      if (a.date && b.date) {
        return b.date.getTime() - a.date.getTime();
      }
      
      return 0;
    });
    
    setResults(searchResults);
    setSelectedIndex(searchResults.length > 0 ? 0 : -1);
  }, [query, activeTab, notes, events, todoItems, habits, transactions]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };
  
  // Scroll selected result into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const selectedElement = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);
  
  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };
  
  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center">
          <FaSearch className="text-slate-400 mr-3" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search across notes, events, tasks, habits, and transactions..."
            className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400"
            autoFocus
          />
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Filter Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-2 flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-2 text-sm font-medium flex items-center ${
              activeTab === 'notes'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FaBook className="mr-1" /> Notes
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-2 text-sm font-medium flex items-center ${
              activeTab === 'events'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FaCalendarAlt className="mr-1" /> Events
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-2 text-sm font-medium flex items-center ${
              activeTab === 'tasks'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FaListUl className="mr-1" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-2 text-sm font-medium flex items-center ${
              activeTab === 'habits'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FaLeaf className="mr-1" /> Habits
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-2 text-sm font-medium flex items-center ${
              activeTab === 'transactions'
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FaMoneyBillWave className="mr-1" /> Transactions
          </button>
        </div>
        
        {/* Results */}
        <div 
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {query.trim() === '' ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <FaSearch className="mx-auto text-3xl mb-2 opacity-30" />
              <p>Type to search across all your content</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <FaSearch className="mx-auto text-3xl mb-2 opacity-30" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  data-index={index}
                  className={`p-4 cursor-pointer ${
                    index === selectedIndex 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {result.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900 dark:text-white truncate">
                          {result.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                          {formatDate(result.date)}
                        </span>
                      </div>
                      {result.preview && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                          {result.preview}
                        </p>
                      )}
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-500 capitalize">
                        {result.type}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Keyboard shortcuts */}
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-center space-x-4">
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 mr-1">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 mr-1">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 mr-1">Enter</kbd>
            to select
          </span>
          <span className="flex items-center">
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 mr-1">Esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
