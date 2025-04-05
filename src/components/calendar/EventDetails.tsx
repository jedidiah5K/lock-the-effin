import React, { useEffect, useState } from 'react';
import { 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaMapMarkerAlt, 
  FaClock, 
  FaCalendarAlt,
  FaBook,
  FaMoneyBillWave,
  FaListUl,
  FaLink
} from 'react-icons/fa';
import { useCalendarStore } from '../../store/calendarStore';
import { useNotesStore } from '../../store/notesStore';
import { useMoneyStore } from '../../store/moneyStore';
import { useTodoStore } from '../../store/todoStore';
import { useNavigate } from 'react-router-dom';

interface EventDetailsProps {
  eventId: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onClose, onEdit, onDelete }) => {
  const { fetchEvent, deleteEvent, selectedEvent } = useCalendarStore();
  const { notes, fetchNote } = useNotesStore();
  const { transactions, fetchTransaction } = useMoneyStore();
  const { todoItems, fetchTodoItem, toggleTodoCompletion } = useTodoStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedNote, setLinkedNote] = useState<any | null>(null);
  const [linkedTransaction, setLinkedTransaction] = useState<any | null>(null);
  const [linkedTodo, setLinkedTodo] = useState<any | null>(null);
  
  const navigate = useNavigate();
  
  // Fetch event data
  useEffect(() => {
    const loadEvent = async () => {
      try {
        await fetchEvent(eventId);
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    loadEvent();
  }, [eventId, fetchEvent]);
  
  // Fetch linked items
  useEffect(() => {
    const loadLinkedItems = async () => {
      if (!selectedEvent) return;
      
      try {
        // Load linked note
        if (selectedEvent.noteId) {
          const note = await fetchNote(selectedEvent.noteId);
          setLinkedNote(note);
        }
        
        // Load linked transaction
        if (selectedEvent.expenseId) {
          const transaction = await fetchTransaction(selectedEvent.expenseId);
          setLinkedTransaction(transaction);
        }
        
        // Load linked todo
        if (selectedEvent.todoId) {
          const todo = await fetchTodoItem(selectedEvent.todoId);
          setLinkedTodo(todo);
        }
      } catch (error: any) {
        console.error('Error loading linked items:', error);
      }
    };
    
    loadLinkedItems();
  }, [selectedEvent, fetchNote, fetchTransaction, fetchTodoItem]);
  
  // Handle delete event
  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      await deleteEvent(selectedEvent.id);
      onDelete();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Navigate to note
  const navigateToNote = () => {
    if (linkedNote) {
      navigate(`/notes/${linkedNote.id}`);
      onClose();
    }
  };
  
  // Navigate to transaction
  const navigateToTransaction = () => {
    if (linkedTransaction) {
      navigate(`/money?transaction=${linkedTransaction.id}`);
      onClose();
    }
  };
  
  // Navigate to todo
  const navigateToTodo = () => {
    if (linkedTodo) {
      navigate(`/todo?item=${linkedTodo.id}`);
      onClose();
    }
  };
  
  // Toggle todo completion
  const handleToggleTodo = async () => {
    if (linkedTodo) {
      await toggleTodoCompletion(linkedTodo.id);
      // Refresh todo data
      await fetchTodoItem(linkedTodo.id);
    }
  };
  
  if (!selectedEvent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-4">
          <p className="text-center text-slate-700 dark:text-slate-300">Loading event details...</p>
        </div>
      </div>
    );
  }
  
  const startDate = new Date(selectedEvent.start);
  const endDate = new Date(selectedEvent.end);
  const isAllDay = selectedEvent.allDay;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Event Details
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
            {/* Event Color Indicator and Title */}
            <div className="flex items-start">
              <div 
                className="w-4 h-4 rounded-full mt-1.5 mr-3 flex-shrink-0" 
                style={{ backgroundColor: selectedEvent.color }}
              />
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {selectedEvent.title}
                </h3>
                
                {/* Date and Time */}
                <div className="mt-2 flex items-start text-slate-600 dark:text-slate-400">
                  <FaCalendarAlt className="mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    {isAllDay ? (
                      startDate.toDateString() === endDate.toDateString() ? (
                        <p>{formatDate(startDate)} (All day)</p>
                      ) : (
                        <p>{formatDate(startDate)} - {formatDate(endDate)} (All day)</p>
                      )
                    ) : (
                      startDate.toDateString() === endDate.toDateString() ? (
                        <p>
                          {formatDate(startDate)}<br />
                          {formatTime(startDate)} - {formatTime(endDate)}
                        </p>
                      ) : (
                        <p>
                          {formatDate(startDate)} {formatTime(startDate)} -<br />
                          {formatDate(endDate)} {formatTime(endDate)}
                        </p>
                      )
                    )}
                    
                    {/* Recurrence */}
                    {selectedEvent.recurrence && (
                      <p className="mt-1 text-sm">
                        Repeats {selectedEvent.recurrence.pattern}
                        {selectedEvent.recurrence.endDate && (
                          <> until {new Date(selectedEvent.recurrence.endDate).toLocaleDateString()}</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Location */}
            {selectedEvent.location && (
              <div className="flex items-start mt-4 text-slate-600 dark:text-slate-400">
                <FaMapMarkerAlt className="mt-0.5 mr-2 flex-shrink-0" />
                <p>{selectedEvent.location}</p>
              </div>
            )}
            
            {/* Description */}
            {selectedEvent.description && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300">
                <p className="whitespace-pre-line">{selectedEvent.description}</p>
              </div>
            )}
            
            {/* Linked Items */}
            {(linkedNote || linkedTransaction || linkedTodo) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <FaLink className="inline mr-1" /> Linked Items
                </h4>
                
                <div className="space-y-3">
                  {/* Linked Note */}
                  {linkedNote && (
                    <div 
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={navigateToNote}
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                        <FaBook className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {linkedNote.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Note • Updated {new Date(linkedNote.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Linked Transaction */}
                  {linkedTransaction && (
                    <div 
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={navigateToTransaction}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                        <FaMoneyBillWave className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {linkedTransaction.description || linkedTransaction.category}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {linkedTransaction.type === 'expense' ? 'Expense' : 'Income'} • 
                          {linkedTransaction.amount} {linkedTransaction.currency} • 
                          {new Date(linkedTransaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Linked Todo */}
                  {linkedTodo && (
                    <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <div 
                        className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mr-3 cursor-pointer"
                        onClick={handleToggleTodo}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          linkedTodo.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {linkedTodo.completed && <FaCheck className="text-xs" />}
                        </div>
                      </div>
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={navigateToTodo}
                      >
                        <p className={`font-medium ${
                          linkedTodo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {linkedTodo.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Task • 
                          {linkedTodo.dueDate && 
                            ` Due ${new Date(linkedTodo.dueDate).toLocaleDateString()} • `
                          }
                          {linkedTodo.priority === 'high' && (
                            <span className="text-red-600 dark:text-red-400">High Priority</span>
                          )}
                          {linkedTodo.priority === 'urgent' && (
                            <span className="text-purple-600 dark:text-purple-400">Urgent</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              disabled={loading}
            >
              <FaTrash className="inline mr-1" />
              Delete
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <FaEdit className="inline mr-1" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
