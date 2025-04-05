import { create } from 'zustand';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuthStore } from './authStore';
import { v4 as uuidv4 } from 'uuid';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: Priority;
  tags: string[];
  noteId?: string;
  eventId?: string;
  habitId?: string;
  parentId?: string;
  children: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  items: string[]; // Array of TodoItem IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
}

interface TodoState {
  todoItems: TodoItem[];
  todoLists: TodoList[];
  selectedItem: TodoItem | null;
  selectedList: TodoList | null;
  loading: boolean;
  error: string | null;
  
  fetchTodoItems: () => Promise<void>;
  fetchTodoItem: (id: string) => Promise<void>;
  createTodoItem: (data: Partial<TodoItem>, listId?: string) => Promise<string>;
  updateTodoItem: (id: string, data: Partial<TodoItem>) => Promise<void>;
  deleteTodoItem: (id: string) => Promise<void>;
  toggleTodoCompletion: (id: string) => Promise<void>;
  
  fetchTodoLists: () => Promise<void>;
  fetchTodoList: (id: string) => Promise<void>;
  createTodoList: (data: Partial<TodoList>) => Promise<string>;
  updateTodoList: (id: string, data: Partial<TodoList>) => Promise<void>;
  deleteTodoList: (id: string) => Promise<void>;
  addItemToList: (itemId: string, listId: string) => Promise<void>;
  removeItemFromList: (itemId: string, listId: string) => Promise<void>;
  
  getDefaultList: () => TodoList | null;
  getOverdueTasks: () => TodoItem[];
  getTodaysTasks: () => TodoItem[];
  getUpcomingTasks: (days: number) => TodoItem[];
  
  clearError: () => void;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todoItems: [],
  todoLists: [],
  selectedItem: null,
  selectedList: null,
  loading: false,
  error: null,
  
  fetchTodoItems: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      const todoItemsQuery = query(
        collection(db, 'todoItems'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const todoItemsSnapshot = await getDocs(todoItemsQuery);
      
      const todoItems: TodoItem[] = [];
      
      todoItemsSnapshot.forEach(doc => {
        const itemData = doc.data();
        todoItems.push({
          ...itemData,
          id: doc.id,
          dueDate: itemData.dueDate ? itemData.dueDate.toDate() : undefined,
          createdAt: itemData.createdAt.toDate(),
          updatedAt: itemData.updatedAt.toDate(),
          completedAt: itemData.completedAt ? itemData.completedAt.toDate() : undefined
        } as TodoItem);
      });
      
      set({ todoItems, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTodoItem: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const todoItemDoc = await getDoc(doc(db, 'todoItems', id));
      
      if (todoItemDoc.exists()) {
        const itemData = todoItemDoc.data();
        set({ 
          selectedItem: {
            ...itemData,
            id: todoItemDoc.id,
            dueDate: itemData.dueDate ? itemData.dueDate.toDate() : undefined,
            createdAt: itemData.createdAt.toDate(),
            updatedAt: itemData.updatedAt.toDate(),
            completedAt: itemData.completedAt ? itemData.completedAt.toDate() : undefined
          } as TodoItem,
          loading: false 
        });
      } else {
        set({ error: 'Todo item not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTodoItem: async (data: Partial<TodoItem>, listId?: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const itemId = data.id || uuidv4();
      const now = new Date();
      
      const newItem: TodoItem = {
        id: itemId,
        title: data.title || 'New Task',
        description: data.description,
        completed: data.completed || false,
        dueDate: data.dueDate,
        priority: data.priority || 'medium',
        tags: data.tags || [],
        noteId: data.noteId,
        eventId: data.eventId,
        habitId: data.habitId,
        parentId: data.parentId,
        children: data.children || [],
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        completedAt: data.completedAt
      };
      
      await setDoc(doc(db, 'todoItems', itemId), {
        ...newItem,
        dueDate: newItem.dueDate,
        createdAt: now,
        updatedAt: now,
        completedAt: newItem.completedAt
      });
      
      // Update local state
      const { todoItems } = get();
      set({ 
        todoItems: [newItem, ...todoItems],
        selectedItem: newItem,
        loading: false 
      });
      
      // Add to list if specified
      if (listId) {
        await get().addItemToList(itemId, listId);
      } else {
        // Add to default list if no list specified
        const defaultList = get().getDefaultList();
        if (defaultList) {
          await get().addItemToList(itemId, defaultList.id);
        }
      }
      
      return itemId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateTodoItem: async (id: string, data: Partial<TodoItem>) => {
    try {
      set({ loading: true, error: null });
      
      const itemRef = doc(db, 'todoItems', id);
      const now = new Date();
      
      // Prepare data for Firestore
      const updateData = { ...data, updatedAt: now };
      
      // Handle date fields
      if ('dueDate' in data) {
        updateData.dueDate = data.dueDate;
      }
      if ('completedAt' in data) {
        updateData.completedAt = data.completedAt;
      }
      
      await updateDoc(itemRef, updateData);
      
      // Update local state
      const { todoItems, selectedItem } = get();
      const updatedItems = todoItems.map(item => 
        item.id === id ? { ...item, ...data, updatedAt: now } : item
      );
      
      set({ 
        todoItems: updatedItems,
        selectedItem: selectedItem?.id === id 
          ? { ...selectedItem, ...data, updatedAt: now } 
          : selectedItem,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTodoItem: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { todoItems, todoLists } = get();
      const itemToDelete = todoItems.find(item => item.id === id);
      
      if (!itemToDelete) {
        throw new Error('Todo item not found');
      }
      
      // Delete the item
      await deleteDoc(doc(db, 'todoItems', id));
      
      // Remove item from any lists it's in
      const updatedLists = [...todoLists];
      let listsChanged = false;
      
      for (let i = 0; i < updatedLists.length; i++) {
        if (updatedLists[i].items.includes(id)) {
          updatedLists[i] = {
            ...updatedLists[i],
            items: updatedLists[i].items.filter(itemId => itemId !== id),
            updatedAt: new Date()
          };
          listsChanged = true;
          
          // Update the list in Firestore
          await updateDoc(doc(db, 'todoLists', updatedLists[i].id), {
            items: updatedLists[i].items,
            updatedAt: updatedLists[i].updatedAt
          });
        }
      }
      
      // Update parent item if this was a subtask
      if (itemToDelete.parentId) {
        const parentItem = todoItems.find(item => item.id === itemToDelete.parentId);
        if (parentItem) {
          const updatedChildren = parentItem.children.filter(childId => childId !== id);
          await get().updateTodoItem(parentItem.id, { 
            children: updatedChildren 
          });
        }
      }
      
      // Delete any child tasks
      for (const childId of itemToDelete.children) {
        await get().deleteTodoItem(childId);
      }
      
      // Update local state
      set({ 
        todoItems: todoItems.filter(item => item.id !== id),
        todoLists: listsChanged ? updatedLists : todoLists,
        selectedItem: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  toggleTodoCompletion: async (id: string) => {
    try {
      const { todoItems } = get();
      const item = todoItems.find(item => item.id === id);
      
      if (!item) {
        throw new Error('Todo item not found');
      }
      
      const now = new Date();
      const completed = !item.completed;
      
      await get().updateTodoItem(id, { 
        completed,
        completedAt: completed ? now : undefined
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  fetchTodoLists: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      const todoListsQuery = query(
        collection(db, 'todoLists'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'asc')
      );
      
      const todoListsSnapshot = await getDocs(todoListsQuery);
      
      const todoLists: TodoList[] = [];
      
      todoListsSnapshot.forEach(doc => {
        const listData = doc.data();
        todoLists.push({
          ...listData,
          id: doc.id,
          createdAt: listData.createdAt.toDate(),
          updatedAt: listData.updatedAt.toDate()
        } as TodoList);
      });
      
      set({ todoLists, loading: false });
      
      // Create default list if none exists
      if (todoLists.length === 0) {
        await get().createTodoList({
          name: 'My Tasks',
          color: '#4f46e5', // Indigo
          isDefault: true
        });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchTodoList: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const todoListDoc = await getDoc(doc(db, 'todoLists', id));
      
      if (todoListDoc.exists()) {
        const listData = todoListDoc.data();
        set({ 
          selectedList: {
            ...listData,
            id: todoListDoc.id,
            createdAt: listData.createdAt.toDate(),
            updatedAt: listData.updatedAt.toDate()
          } as TodoList,
          loading: false 
        });
      } else {
        set({ error: 'Todo list not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createTodoList: async (data: Partial<TodoList>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const listId = data.id || uuidv4();
      const now = new Date();
      
      const newList: TodoList = {
        id: listId,
        name: data.name || 'New List',
        description: data.description,
        color: data.color || '#4f46e5', // Default indigo
        icon: data.icon,
        items: data.items || [],
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        isDefault: data.isDefault || false
      };
      
      await setDoc(doc(db, 'todoLists', listId), {
        ...newList,
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { todoLists } = get();
      
      // If this is a default list, make sure no other list is default
      let updatedLists = [...todoLists];
      if (newList.isDefault) {
        updatedLists = updatedLists.map(list => ({
          ...list,
          isDefault: false
        }));
        
        // Update other lists in Firestore
        for (const list of todoLists) {
          if (list.isDefault) {
            await updateDoc(doc(db, 'todoLists', list.id), {
              isDefault: false,
              updatedAt: now
            });
          }
        }
      }
      
      set({ 
        todoLists: [newList, ...updatedLists],
        selectedList: newList,
        loading: false 
      });
      
      return listId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateTodoList: async (id: string, data: Partial<TodoList>) => {
    try {
      set({ loading: true, error: null });
      
      const listRef = doc(db, 'todoLists', id);
      const now = new Date();
      
      await updateDoc(listRef, {
        ...data,
        updatedAt: now
      });
      
      // Update local state
      const { todoLists, selectedList } = get();
      
      // Handle default list changes
      let updatedLists = todoLists.map(list => 
        list.id === id ? { ...list, ...data, updatedAt: now } : list
      );
      
      // If this list is being set as default, make sure no other list is default
      if (data.isDefault) {
        updatedLists = updatedLists.map(list => ({
          ...list,
          isDefault: list.id === id ? true : false
        }));
        
        // Update other lists in Firestore
        for (const list of todoLists) {
          if (list.id !== id && list.isDefault) {
            await updateDoc(doc(db, 'todoLists', list.id), {
              isDefault: false,
              updatedAt: now
            });
          }
        }
      }
      
      set({ 
        todoLists: updatedLists,
        selectedList: selectedList?.id === id 
          ? { ...selectedList, ...data, updatedAt: now } 
          : selectedList,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteTodoList: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const { todoLists, todoItems } = get();
      const listToDelete = todoLists.find(list => list.id === id);
      
      if (!listToDelete) {
        throw new Error('Todo list not found');
      }
      
      // Don't allow deleting the default list
      if (listToDelete.isDefault) {
        throw new Error('Cannot delete the default list');
      }
      
      // Delete the list
      await deleteDoc(doc(db, 'todoLists', id));
      
      // Move items to default list
      const defaultList = todoLists.find(list => list.isDefault && list.id !== id);
      if (defaultList && listToDelete.items.length > 0) {
        const updatedItems = [...defaultList.items, ...listToDelete.items];
        await get().updateTodoList(defaultList.id, { 
          items: updatedItems 
        });
      }
      
      // Update local state
      set({ 
        todoLists: todoLists.filter(list => list.id !== id),
        selectedList: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  addItemToList: async (itemId: string, listId: string) => {
    try {
      const { todoLists } = get();
      const list = todoLists.find(list => list.id === listId);
      
      if (!list) {
        throw new Error('Todo list not found');
      }
      
      // Check if item is already in the list
      if (list.items.includes(itemId)) {
        return;
      }
      
      const updatedItems = [...list.items, itemId];
      await get().updateTodoList(listId, { items: updatedItems });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  removeItemFromList: async (itemId: string, listId: string) => {
    try {
      const { todoLists } = get();
      const list = todoLists.find(list => list.id === listId);
      
      if (!list) {
        throw new Error('Todo list not found');
      }
      
      const updatedItems = list.items.filter(id => id !== itemId);
      await get().updateTodoList(listId, { items: updatedItems });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  getDefaultList: () => {
    const { todoLists } = get();
    return todoLists.find(list => list.isDefault) || null;
  },
  
  getOverdueTasks: () => {
    const { todoItems } = get();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    return todoItems.filter(item => 
      !item.completed && 
      item.dueDate && 
      new Date(item.dueDate) < now
    );
  },
  
  getTodaysTasks: () => {
    const { todoItems } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return todoItems.filter(item => 
      item.dueDate && 
      new Date(item.dueDate) >= today && 
      new Date(item.dueDate) < tomorrow
    );
  },
  
  getUpcomingTasks: (days = 7) => {
    const { todoItems } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    
    return todoItems.filter(item => 
      !item.completed && 
      item.dueDate && 
      new Date(item.dueDate) >= today && 
      new Date(item.dueDate) < future
    );
  },
  
  clearError: () => set({ error: null }),
}));
