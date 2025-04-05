import React, { useState, useEffect } from 'react';
import { FaTimes, FaListUl } from 'react-icons/fa';
import { useTodoStore, TodoList } from '../../store/todoStore';

interface TodoListFormProps {
  onClose: () => void;
  onSuccess: () => void;
  listId?: string | null;
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

const TodoListForm: React.FC<TodoListFormProps> = ({ onClose, onSuccess, listId }) => {
  const { 
    createTodoList, 
    updateTodoList, 
    fetchTodoList, 
    selectedList, 
    loading, 
    error 
  } = useTodoStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [isDefault, setIsDefault] = useState(false);
  
  // Fetch list data if editing
  useEffect(() => {
    if (listId) {
      fetchTodoList(listId);
    }
  }, [listId, fetchTodoList]);
  
  // Populate form with list data if editing
  useEffect(() => {
    if (selectedList) {
      setName(selectedList.name);
      setDescription(selectedList.description || '');
      setColor(selectedList.color);
      setIsDefault(selectedList.isDefault);
    }
  }, [selectedList]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    try {
      const listData = {
        name,
        description: description || undefined,
        color,
        isDefault
      };
      
      if (listId && selectedList) {
        await updateTodoList(listId, listData);
      } else {
        await createTodoList(listData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving todo list:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {listId ? 'Edit List' : 'Create List'}
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
                List Name *
              </label>
              <div className="relative">
                <FaListUl className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                  placeholder="My List"
                  required
                />
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
                placeholder="Optional description for this list"
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
            
            {/* Default List */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Make this the default list
              </label>
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
              disabled={loading || !name.trim()}
            >
              {loading ? 'Saving...' : listId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoListForm;
