import React, { useEffect, useState } from 'react';
import { 
  FaTimes, 
  FaEdit, 
  FaTrash, 
  FaCalendarAlt, 
  FaTag,
  FaBook,
  FaCalendarCheck,
  FaLeaf,
  FaCheck,
  FaPlus,
  FaListUl
} from 'react-icons/fa';
import { useTodoStore } from '../../store/todoStore';
import { useNotesStore } from '../../store/notesStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useHabitStore } from '../../store/habitStore';
import { useNavigate } from 'react-router-dom';
import TodoItemForm from './TodoItemForm';

interface TodoItemDetailsProps {
  itemId: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TodoItemDetails: React.FC<TodoItemDetailsProps> = ({ 
  itemId, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  const { 
    fetchTodoItem, 
    deleteTodoItem, 
    toggleTodoCompletion, 
    selectedItem,
    todoItems,
    fetchTodoItems
  } = useTodoStore();
  
  const { notes, fetchNote } = useNotesStore();
  const { events, fetchEvent } = useCalendarStore();
  const { habits, fetchHabit } = useHabitStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedNote, setLinkedNote] = useState<any | null>(null);
  const [linkedEvent, setLinkedEvent] = useState<any | null>(null);
  const [linkedHabit, setLinkedHabit] = useState<any | null>(null);
  const [showSubtaskForm, setShowSubtaskForm] = useState(false);
  const [childTasks, setChildTasks] = useState<any[]>([]);
  
  const navigate = useNavigate();
  
  // Fetch todo item data
  useEffect(() => {
    const loadTodoItem = async () => {
      try {
        await fetchTodoItem(itemId);
        await fetchTodoItems();
      } catch (error: any) {
        setError(error.message);
      }
    };
    
    loadTodoItem();
  }, [itemId, fetchTodoItem, fetchTodoItems]);
  
  // Fetch linked items and child tasks
  useEffect(() => {
    const loadLinkedItems = async () => {
      if (!selectedItem) return;
      
      try {
        // Load linked note
        if (selectedItem.noteId) {
          const note = await fetchNote(selectedItem.noteId);
          setLinkedNote(note);
        }
        
        // Load linked event
        if (selectedItem.eventId) {
          const event = await fetchEvent(selectedItem.eventId);
          setLinkedEvent(event);
        }
        
        // Load linked habit
        if (selectedItem.habitId) {
          const habit = await fetchHabit(selectedItem.habitId);
          setLinkedHabit(habit);
        }
        
        // Get child tasks
        const children = todoItems.filter(item => item.parentId === selectedItem.id);
        setChildTasks(children);
      } catch (error: any) {
        console.error('Error loading linked items:', error);
      }
    };
    
    loadLinkedItems();
  }, [selectedItem, fetchNote, fetchEvent, fetchHabit, todoItems]);
  
  // Handle delete todo item
  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      setLoading(true);
      await deleteTodoItem(selectedItem.id);
      onDelete();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Navigate to note
  const navigateToNote = () => {
    if (linkedNote) {
      navigate(`/notes/${linkedNote.id}`);
      onClose();
    }
  };
  
  // Navigate to event
  const navigateToEvent = () => {
    if (linkedEvent) {
      navigate(`/calendar?event=${linkedEvent.id}`);
      onClose();
    }
  };
  
  // Navigate to habit
  const navigateToHabit = () => {
    if (linkedHabit) {
      navigate(`/habits?habit=${linkedHabit.id}`);
      onClose();
    }
  };
  
  // Toggle todo completion
  const handleToggleCompletion = async () => {
    if (selectedItem) {
      await toggleTodoCompletion(selectedItem.id);
      // Refresh todo data
      await fetchTodoItem(selectedItem.id);
    }
  };
  
  // Toggle child task completion
  const handleToggleChildCompletion = async (childId: string) => {
    await toggleTodoCompletion(childId);
    // Refresh child tasks
    const updatedChildren = todoItems.filter(item => item.parentId === selectedItem?.id);
    setChildTasks(updatedChildren);
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-blue-500 dark:text-blue-400';
      case 'medium':
        return 'text-amber-500 dark:text-amber-400';
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'urgent':
        return 'text-purple-500 dark:text-purple-400';
      default:
        return 'text-slate-500 dark:text-slate-400';
    }
  };
  
  if (!selectedItem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-4">
          <p className="text-center text-slate-700 dark:text-slate-300">Loading task details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Task Details
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
            {/* Task Title and Completion Status */}
            <div className="flex items-start">
              <button
                onClick={handleToggleCompletion}
                className={`w-6 h-6 rounded-full border flex items-center justify-center mt-1 mr-3 ${
                  selectedItem.completed 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedItem.completed && <FaCheck />}
              </button>
              <div>
                <h3 className={`text-xl font-semibold ${
                  selectedItem.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {selectedItem.title}
                </h3>
                
                {/* Completion Status */}
                {selectedItem.completed && selectedItem.completedAt && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Completed on {formatDate(selectedItem.completedAt)} at {formatTime(selectedItem.completedAt)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description */}
            {selectedItem.description && (
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300">
                <p className="whitespace-pre-line">{selectedItem.description}</p>
              </div>
            )}
            
            {/* Due Date */}
            {selectedItem.dueDate && (
              <div className="flex items-start mt-4 text-slate-600 dark:text-slate-400">
                <FaCalendarAlt className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p>
                    Due: {formatDate(selectedItem.dueDate)} at {formatTime(selectedItem.dueDate)}
                  </p>
                  {new Date(selectedItem.dueDate) < new Date() && !selectedItem.completed && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                      Overdue
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Priority */}
            <div className="flex items-center mt-4">
              <span className={`font-medium ${getPriorityColor(selectedItem.priority)}`}>
                {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority
              </span>
            </div>
            
            {/* Tags */}
            {selectedItem.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  <FaTag className="inline mr-1" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Linked Items */}
            {(linkedNote || linkedEvent || linkedHabit) && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Linked Items
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
                  
                  {/* Linked Event */}
                  {linkedEvent && (
                    <div 
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={navigateToEvent}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mr-3">
                        <FaCalendarCheck className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {linkedEvent.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Event • {new Date(linkedEvent.start).toLocaleDateString()} at {new Date(linkedEvent.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Linked Habit */}
                  {linkedHabit && (
                    <div 
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={navigateToHabit}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mr-3">
                        <FaLeaf className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {linkedHabit.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Habit
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Subtasks */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  <FaListUl className="inline mr-1" /> Subtasks ({childTasks.length})
                </h4>
                <button 
                  onClick={() => setShowSubtaskForm(true)}
                  className="text-xs flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <FaPlus className="mr-1" /> Add Subtask
                </button>
              </div>
              
              {childTasks.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  No subtasks yet
                </p>
              ) : (
                <ul className="space-y-2 mt-2">
                  {childTasks.map(task => (
                    <li key={task.id} className="flex items-center p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                      <button
                        onClick={() => handleToggleChildCompletion(task.id)}
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
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Created/Updated Info */}
            <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              <p>Created: {formatDate(selectedItem.createdAt)}</p>
              <p>Last updated: {formatDate(selectedItem.updatedAt)}</p>
            </div>
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
      
      {/* Subtask Form Modal */}
      {showSubtaskForm && (
        <TodoItemForm 
          onClose={() => setShowSubtaskForm(false)} 
          onSuccess={() => {
            setShowSubtaskForm(false);
            fetchTodoItem(itemId);
            fetchTodoItems();
          }}
          parentId={selectedItem.id}
        />
      )}
    </div>
  );
};

export default TodoItemDetails;
