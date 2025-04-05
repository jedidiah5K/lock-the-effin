import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaCalendarAlt, 
  FaTag, 
  FaListUl,
  FaBook,
  FaCalendarCheck,
  FaLeaf,
  FaLink
} from 'react-icons/fa';
import { useTodoStore, Priority } from '../../store/todoStore';
import { useNotesStore } from '../../store/notesStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useHabitStore } from '../../store/habitStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TodoItemFormProps {
  onClose: () => void;
  onSuccess: () => void;
  itemId?: string | null;
  listId?: string;
  parentId?: string;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

const TodoItemForm: React.FC<TodoItemFormProps> = ({ 
  onClose, 
  onSuccess, 
  itemId, 
  listId,
  parentId
}) => {
  const { 
    createTodoItem, 
    updateTodoItem, 
    fetchTodoItem, 
    todoItems,
    todoLists,
    selectedItem, 
    loading, 
    error 
  } = useTodoStore();
  
  const { notes } = useNotesStore();
  const { events } = useCalendarStore();
  const { habits } = useHabitStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedListId, setSelectedListId] = useState<string | undefined>(listId);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentId || null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Fetch item data if editing
  useEffect(() => {
    if (itemId) {
      fetchTodoItem(itemId);
    }
  }, [itemId, fetchTodoItem]);
  
  // Populate form with item data if editing
  useEffect(() => {
    if (selectedItem) {
      setTitle(selectedItem.title);
      setDescription(selectedItem.description || '');
      setDueDate(selectedItem.dueDate || null);
      setPriority(selectedItem.priority);
      setTags(selectedItem.tags);
      setSelectedNoteId(selectedItem.noteId || null);
      setSelectedEventId(selectedItem.eventId || null);
      setSelectedHabitId(selectedItem.habitId || null);
      setSelectedParentId(selectedItem.parentId || null);
      
      // Find list containing this item
      if (!listId) {
        const containingList = todoLists.find(list => list.items.includes(selectedItem.id));
        if (containingList) {
          setSelectedListId(containingList.id);
        }
      }
    }
  }, [selectedItem, todoLists, listId]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    try {
      const todoData = {
        title,
        description: description || undefined,
        dueDate: dueDate || undefined,
        priority,
        tags,
        noteId: selectedNoteId || undefined,
        eventId: selectedEventId || undefined,
        habitId: selectedHabitId || undefined,
        parentId: selectedParentId || undefined
      };
      
      if (itemId && selectedItem) {
        await updateTodoItem(itemId, todoData);
      } else {
        await createTodoItem(todoData, selectedListId);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving todo item:', error);
    }
  };
  
  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };
  
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Get potential parent tasks (excluding the current task and its children)
  const getPotentialParentTasks = () => {
    if (!itemId) return todoItems.filter(item => !item.parentId);
    
    // Get all descendant IDs to avoid circular references
    const getDescendantIds = (taskId: string): string[] => {
      const directChildren = todoItems.filter(item => item.parentId === taskId);
      return [
        taskId,
        ...directChildren.flatMap(child => getDescendantIds(child.id))
      ];
    };
    
    const excludeIds = getDescendantIds(itemId);
    return todoItems.filter(item => !excludeIds.includes(item.id) && !item.parentId);
  };
  
  const potentialParentTasks = getPotentialParentTasks();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {itemId ? 'Edit Task' : 'Create Task'}
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
                placeholder="What needs to be done?"
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
                placeholder="Add details about this task"
              />
            </div>
            
            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <div className="relative">
                <DatePicker
                  selected={dueDate}
                  onChange={(date: Date | null) => setDueDate(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholderText="Set due date and time"
                  isClearable
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
            
            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* List */}
            <div>
              <label htmlFor="listId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaListUl className="mr-1 text-indigo-500" />
                  List
                </div>
              </label>
              <select
                id="listId"
                value={selectedListId || ''}
                onChange={(e) => setSelectedListId(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select a list</option>
                {todoLists.map(list => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Parent Task (if not already a subtask) */}
            {!parentId && (
              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <div className="flex items-center">
                    <FaListUl className="mr-1 text-slate-500" />
                    Parent Task (optional)
                  </div>
                </label>
                <select
                  id="parentId"
                  value={selectedParentId || ''}
                  onChange={(e) => setSelectedParentId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="">None (Top-level task)</option>
                  {potentialParentTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaTag className="mr-1 text-amber-500" />
                  Tags
                </div>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {tag}
                    <button 
                      type="button" 
                      className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                      onClick={() => removeTag(tag)}
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                placeholder="Add tags (press Enter to add)"
              />
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
            
            {/* Link to Event */}
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaCalendarCheck className="mr-1 text-blue-500" />
                  Link to Event
                </div>
              </label>
              <select
                id="eventId"
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">None</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({new Date(event.start).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Link to Habit */}
            <div>
              <label htmlFor="habitId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <div className="flex items-center">
                  <FaLeaf className="mr-1 text-green-500" />
                  Link to Habit
                </div>
              </label>
              <select
                id="habitId"
                value={selectedHabitId || ''}
                onChange={(e) => setSelectedHabitId(e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="">None</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
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
              disabled={loading || !title.trim()}
            >
              {loading ? 'Saving...' : itemId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoItemForm;
