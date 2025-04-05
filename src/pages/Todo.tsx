import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaListUl, 
  FaCalendarAlt, 
  FaFilter, 
  FaEllipsisH,
  FaCheck,
  FaTrash,
  FaEdit,
  FaLink,
  FaExclamationCircle,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTodoStore, TodoItem, TodoList, Priority } from '../store/todoStore';
import TodoItemForm from '../components/todo/TodoItemForm';
import TodoListForm from '../components/todo/TodoListForm';
import TodoItemDetails from '../components/todo/TodoItemDetails';

const Todo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const itemParam = queryParams.get('item');
  const listParam = queryParams.get('list');
  
  const { 
    todoItems, 
    todoLists, 
    fetchTodoItems, 
    fetchTodoLists,
    fetchTodoItem,
    fetchTodoList,
    toggleTodoCompletion,
    getDefaultList,
    getOverdueTasks,
    getTodaysTasks,
    getUpcomingTasks,
    loading,
    error
  } = useTodoStore();
  
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [view, setView] = useState<'lists' | 'smart'>('lists');
  const [smartView, setSmartView] = useState<'overdue' | 'today' | 'upcoming'>('today');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Fetch data on component mount
  useEffect(() => {
    fetchTodoItems();
    fetchTodoLists();
  }, [fetchTodoItems, fetchTodoLists]);
  
  // Set default list if none selected
  useEffect(() => {
    if (todoLists.length > 0 && !selectedListId) {
      if (listParam) {
        setSelectedListId(listParam);
        fetchTodoList(listParam);
      } else {
        const defaultList = getDefaultList();
        if (defaultList) {
          setSelectedListId(defaultList.id);
        } else {
          setSelectedListId(todoLists[0].id);
        }
      }
    }
  }, [todoLists, selectedListId, listParam, getDefaultList, fetchTodoList]);
  
  // Handle item param from URL
  useEffect(() => {
    if (itemParam) {
      setSelectedItemId(itemParam);
      fetchTodoItem(itemParam);
    }
  }, [itemParam, fetchTodoItem]);
  
  // Get filtered items based on selected list or smart view
  const getFilteredItems = () => {
    if (view === 'smart') {
      switch (smartView) {
        case 'overdue':
          return getOverdueTasks();
        case 'today':
          return getTodaysTasks();
        case 'upcoming':
          return getUpcomingTasks(7);
        default:
          return [];
      }
    } else if (selectedListId) {
      const list = todoLists.find(list => list.id === selectedListId);
      if (list) {
        return todoItems.filter(item => list.items.includes(item.id) && !item.parentId);
      }
    }
    return [];
  };
  
  // Get child tasks for a parent task
  const getChildTasks = (parentId: string) => {
    return todoItems.filter(item => item.parentId === parentId);
  };
  
  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Handle list selection
  const handleListSelect = (listId: string) => {
    setSelectedListId(listId);
    setView('lists');
    navigate(`/todo?list=${listId}`);
  };
  
  // Handle smart view selection
  const handleSmartViewSelect = (view: 'overdue' | 'today' | 'upcoming') => {
    setSmartView(view);
    setView('smart');
    navigate('/todo');
  };
  
  // Handle add task
  const handleAddTask = () => {
    setEditingItemId(null);
    setShowItemForm(true);
  };
  
  // Handle add list
  const handleAddList = () => {
    setEditingListId(null);
    setShowListForm(true);
  };
  
  // Handle edit task
  const handleEditTask = (taskId: string) => {
    setEditingItemId(taskId);
    setShowItemForm(true);
  };
  
  // Handle edit list
  const handleEditList = (listId: string) => {
    setEditingListId(listId);
    setShowListForm(true);
  };
  
  // Handle view task details
  const handleViewTaskDetails = (taskId: string) => {
    setSelectedItemId(taskId);
    navigate(`/todo?item=${taskId}`);
  };
  
  // Format due date
  const formatDueDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else if (dueDate < today) {
      return `Overdue: ${dueDate.toLocaleDateString()}`;
    } else {
      return dueDate.toLocaleDateString();
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: Priority) => {
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
  
  const filteredItems = getFilteredItems();
  
  return (
    <div className="todo-page p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Tasks</h1>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleAddTask}
            className="btn-primary py-2 px-4 flex items-center"
          >
            <FaPlus className="mr-2" />
            <span>Add Task</span>
          </button>
          
          <button 
            onClick={handleAddList}
            className="btn-outline py-2 px-4 flex items-center"
          >
            <FaListUl className="mr-2" />
            <span>New List</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lists</h2>
            </div>
            
            <div className="p-2">
              {/* Smart Lists */}
              <div className="mb-4">
                <h3 className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Smart Lists
                </h3>
                <ul>
                  <li>
                    <button
                      onClick={() => handleSmartViewSelect('overdue')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg ${
                        view === 'smart' && smartView === 'overdue' 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FaExclamationCircle className="mr-3 text-red-500" />
                      <span>Overdue</span>
                      <span className="ml-auto bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full px-2 py-0.5 text-xs">
                        {getOverdueTasks().length}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSmartViewSelect('today')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg ${
                        view === 'smart' && smartView === 'today' 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FaCalendarAlt className="mr-3 text-indigo-500" />
                      <span>Today</span>
                      <span className="ml-auto bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-full px-2 py-0.5 text-xs">
                        {getTodaysTasks().length}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleSmartViewSelect('upcoming')}
                      className={`w-full flex items-center px-3 py-2 rounded-lg ${
                        view === 'smart' && smartView === 'upcoming' 
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <FaCalendarAlt className="mr-3 text-green-500" />
                      <span>Upcoming (7 days)</span>
                      <span className="ml-auto bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full px-2 py-0.5 text-xs">
                        {getUpcomingTasks(7).length}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
              
              {/* Custom Lists */}
              <div>
                <h3 className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  My Lists
                </h3>
                {loading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <ul>
                    {todoLists.map(list => (
                      <li key={list.id}>
                        <div className="flex items-center group">
                          <button
                            onClick={() => handleListSelect(list.id)}
                            className={`flex-1 flex items-center px-3 py-2 rounded-lg ${
                              view === 'lists' && selectedListId === list.id 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <div 
                              className="w-3 h-3 rounded-full mr-3" 
                              style={{ backgroundColor: list.color }}
                            />
                            <span>{list.name}</span>
                            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                              {list.items.length}
                            </span>
                          </button>
                          <button 
                            onClick={() => handleEditList(list.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            <FaEllipsisH />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {view === 'smart' ? (
                  smartView === 'overdue' ? 'Overdue Tasks' : 
                  smartView === 'today' ? 'Today\'s Tasks' : 
                  'Upcoming Tasks'
                ) : (
                  todoLists.find(list => list.id === selectedListId)?.name || 'Tasks'
                )}
              </h2>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <FaFilter />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <FaListUl className="text-2xl text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tasks yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  {view === 'smart' ? 'No tasks for this time period' : 'Add a task to get started'}
                </p>
                <button 
                  onClick={handleAddTask}
                  className="btn-primary py-2 px-4 flex items-center mx-auto"
                >
                  <FaPlus className="mr-2" />
                  <span>Add Task</span>
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredItems.map(item => (
                  <React.Fragment key={item.id}>
                    <li className="group">
                      <div className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
                        <button
                          onClick={() => toggleTodoCompletion(item.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            item.completed 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {item.completed && <FaCheck className="text-xs" />}
                        </button>
                        
                        <div className="flex-1 min-w-0" onClick={() => handleViewTaskDetails(item.id)}>
                          <div className="flex items-center">
                            <p className={`font-medium ${
                              item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}>
                              {item.title}
                            </p>
                            {(item.noteId || item.eventId || item.habitId) && (
                              <FaLink className="ml-2 text-xs text-slate-400" />
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center mt-1 text-xs">
                            {item.dueDate && (
                              <span className={`mr-2 flex items-center ${
                                new Date(item.dueDate) < new Date() && !item.completed
                                  ? 'text-red-500 dark:text-red-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}>
                                <FaCalendarAlt className="mr-1" />
                                {formatDueDate(item.dueDate)}
                              </span>
                            )}
                            
                            {item.priority !== 'medium' && (
                              <span className={`mr-2 ${getPriorityColor(item.priority)}`}>
                                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                              </span>
                            )}
                            
                            {item.children.length > 0 && (
                              <span className="text-slate-500 dark:text-slate-400">
                                {item.children.filter(childId => 
                                  todoItems.find(ti => ti.id === childId)?.completed
                                ).length} / {item.children.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {item.children.length > 0 && (
                            <button
                              onClick={() => toggleTaskExpansion(item.id)}
                              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                              {expandedItems[item.id] ? <FaChevronDown /> : <FaChevronRight />}
                            </button>
                          )}
                          
                          <div className="flex opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleEditTask(item.id)}
                              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    {/* Subtasks */}
                    {expandedItems[item.id] && getChildTasks(item.id).map(childTask => (
                      <li key={childTask.id} className="group pl-10 border-t-0">
                        <div className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
                          <button
                            onClick={() => toggleTodoCompletion(childTask.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                              childTask.completed 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {childTask.completed && <FaCheck className="text-xs" />}
                          </button>
                          
                          <div className="flex-1 min-w-0" onClick={() => handleViewTaskDetails(childTask.id)}>
                            <p className={`font-medium ${
                              childTask.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}>
                              {childTask.title}
                            </p>
                            
                            {childTask.dueDate && (
                              <div className="flex items-center mt-1 text-xs">
                                <span className={`mr-2 flex items-center ${
                                  new Date(childTask.dueDate) < new Date() && !childTask.completed
                                    ? 'text-red-500 dark:text-red-400'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  <FaCalendarAlt className="mr-1" />
                                  {formatDueDate(childTask.dueDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleEditTask(childTask.id)}
                              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </React.Fragment>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Todo Item Form Modal */}
      {showItemForm && (
        <TodoItemForm 
          onClose={() => setShowItemForm(false)} 
          onSuccess={() => {
            setShowItemForm(false);
            fetchTodoItems();
            fetchTodoLists();
          }}
          itemId={editingItemId}
          listId={selectedListId || undefined}
        />
      )}
      
      {/* Todo List Form Modal */}
      {showListForm && (
        <TodoListForm 
          onClose={() => setShowListForm(false)} 
          onSuccess={() => {
            setShowListForm(false);
            fetchTodoLists();
          }}
          listId={editingListId}
        />
      )}
      
      {/* Todo Item Details Modal */}
      {selectedItemId && (
        <TodoItemDetails 
          itemId={selectedItemId} 
          onClose={() => {
            setSelectedItemId(null);
            navigate(selectedListId ? `/todo?list=${selectedListId}` : '/todo');
          }}
          onEdit={() => {
            setEditingItemId(selectedItemId);
            setSelectedItemId(null);
            setShowItemForm(true);
          }}
          onDelete={() => {
            setSelectedItemId(null);
            fetchTodoItems();
            fetchTodoLists();
          }}
        />
      )}
    </div>
  );
};

export default Todo;
