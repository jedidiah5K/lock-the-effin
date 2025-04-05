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

export interface HabitEntry {
  id: string;
  date: Date;
  completed: boolean;
  note?: string;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  startDate: Date;
  endDate?: Date;
  entries: HabitEntry[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  locked: boolean;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  targetDate?: Date;
  progress: number;
  target: number;
  unit: string;
  category: string;
  color: string;
  relatedHabits: string[];
  locked: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
}

interface HabitState {
  habits: Habit[];
  goals: Goal[];
  selectedHabit: Habit | null;
  selectedGoal: Goal | null;
  loading: boolean;
  error: string | null;
  
  fetchHabits: () => Promise<void>;
  fetchHabit: (id: string) => Promise<void>;
  createHabit: (data: Partial<Habit>) => Promise<string>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date, note?: string) => Promise<void>;
  archiveHabit: (id: string, archived: boolean) => Promise<void>;
  lockHabit: (id: string) => Promise<void>;
  
  fetchGoals: () => Promise<void>;
  fetchGoal: (id: string) => Promise<void>;
  createGoal: (data: Partial<Goal>) => Promise<string>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  toggleGoalLock: (id: string) => Promise<void>;
  
  getHabitStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
  
  clearError: () => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  goals: [],
  selectedHabit: null,
  selectedGoal: null,
  loading: false,
  error: null,
  
  fetchHabits: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      const habitsQuery = query(
        collection(db, 'habits'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const habitsSnapshot = await getDocs(habitsQuery);
      
      const habits: Habit[] = [];
      
      habitsSnapshot.forEach(doc => {
        const habitData = doc.data();
        habits.push({
          ...habitData,
          id: doc.id,
          startDate: habitData.startDate.toDate(),
          endDate: habitData.endDate ? habitData.endDate.toDate() : undefined,
          entries: habitData.entries.map((entry: any) => ({
            ...entry,
            date: entry.date.toDate()
          })),
          createdAt: habitData.createdAt.toDate(),
          updatedAt: habitData.updatedAt.toDate()
        } as Habit);
      });
      
      set({ habits, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchHabit: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const habitDoc = await getDoc(doc(db, 'habits', id));
      
      if (habitDoc.exists()) {
        const habitData = habitDoc.data();
        set({ 
          selectedHabit: {
            ...habitData,
            id: habitDoc.id,
            startDate: habitData.startDate.toDate(),
            endDate: habitData.endDate ? habitData.endDate.toDate() : undefined,
            entries: habitData.entries.map((entry: any) => ({
              ...entry,
              date: entry.date.toDate()
            })),
            createdAt: habitData.createdAt.toDate(),
            updatedAt: habitData.updatedAt.toDate()
          } as Habit,
          loading: false 
        });
      } else {
        set({ error: 'Habit not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createHabit: async (data: Partial<Habit>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const habitId = data.id || uuidv4();
      const now = new Date();
      
      const newHabit: Habit = {
        id: habitId,
        name: data.name || 'New Habit',
        description: data.description,
        icon: data.icon,
        color: data.color || '#4f46e5', // Default indigo
        frequency: data.frequency || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true
        },
        timeOfDay: data.timeOfDay || 'anytime',
        startDate: data.startDate || now,
        endDate: data.endDate,
        entries: data.entries || [],
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        archived: data.archived || false,
        locked: data.locked || false
      };
      
      await setDoc(doc(db, 'habits', habitId), {
        ...newHabit,
        startDate: newHabit.startDate,
        endDate: newHabit.endDate,
        entries: newHabit.entries.map(entry => ({
          ...entry,
          date: entry.date
        })),
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { habits } = get();
      set({ 
        habits: [newHabit, ...habits],
        selectedHabit: newHabit,
        loading: false 
      });
      
      return habitId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateHabit: async (id: string, data: Partial<Habit>) => {
    try {
      set({ loading: true, error: null });
      
      const habitRef = doc(db, 'habits', id);
      const now = new Date();
      
      // Prepare entries for Firestore if they exist in the update
      const firestoreData = { ...data, updatedAt: now };
      if (data.entries) {
        firestoreData.entries = data.entries.map(entry => ({
          ...entry,
          date: entry.date
        }));
      }
      
      await updateDoc(habitRef, firestoreData);
      
      // Update local state
      const { habits, selectedHabit } = get();
      const updatedHabits = habits.map(habit => 
        habit.id === id ? { ...habit, ...data, updatedAt: now } : habit
      );
      
      set({ 
        habits: updatedHabits,
        selectedHabit: selectedHabit?.id === id 
          ? { ...selectedHabit, ...data, updatedAt: now } 
          : selectedHabit,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteHabit: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'habits', id));
      
      // Update local state
      const { habits, goals } = get();
      
      // Remove habit from goals
      const updatedGoals = goals.map(goal => {
        if (goal.relatedHabits.includes(id)) {
          return {
            ...goal,
            relatedHabits: goal.relatedHabits.filter(habitId => habitId !== id)
          };
        }
        return goal;
      });
      
      set({ 
        habits: habits.filter(habit => habit.id !== id),
        goals: updatedGoals,
        selectedHabit: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  toggleHabitCompletion: async (habitId: string, date: Date, note?: string) => {
    try {
      const { habits } = get();
      const habit = habits.find(h => h.id === habitId);
      
      if (!habit) {
        throw new Error('Habit not found');
      }
      
      // Format date to remove time component for comparison
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      // Check if entry already exists for this date
      const existingEntryIndex = habit.entries.findIndex(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === targetDate.getTime();
      });
      
      let updatedEntries;
      
      if (existingEntryIndex >= 0) {
        // Toggle completion status if entry exists
        const existingEntry = habit.entries[existingEntryIndex];
        updatedEntries = [...habit.entries];
        updatedEntries[existingEntryIndex] = {
          ...existingEntry,
          completed: !existingEntry.completed,
          note: note || existingEntry.note
        };
      } else {
        // Create new entry if it doesn't exist
        const newEntry: HabitEntry = {
          id: uuidv4(),
          date: targetDate,
          completed: true,
          note
        };
        updatedEntries = [...habit.entries, newEntry];
      }
      
      // Update habit with new entries
      await get().updateHabit(habitId, { entries: updatedEntries });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  archiveHabit: async (id: string, archived: boolean) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const habitRef = doc(db, 'habits', id);
      const habitDoc = await getDoc(habitRef);
      
      if (!habitDoc.exists()) {
        throw new Error('Habit not found');
      }
      
      // Check if the habit belongs to the current user
      const habitData = habitDoc.data();
      if (habitData.createdBy !== user.uid) {
        throw new Error('You do not have permission to archive this habit');
      }
      
      await updateDoc(habitRef, { 
        archived,
        updatedAt: new Date()
      });
      
      // Update the habits list
      const habits = get().habits.map(habit => 
        habit.id === id ? { ...habit, archived, updatedAt: new Date() } : habit
      );
      
      // Update selected habit if it's the one being archived
      const selectedHabit = get().selectedHabit;
      if (selectedHabit && selectedHabit.id === id) {
        set({ selectedHabit: { ...selectedHabit, archived, updatedAt: new Date() } });
      }
      
      set({ habits, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  lockHabit: async (id: string) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const habitRef = doc(db, 'habits', id);
      const habitDoc = await getDoc(habitRef);
      
      if (!habitDoc.exists()) {
        throw new Error('Habit not found');
      }
      
      // Check if the habit belongs to the current user
      const habitData = habitDoc.data();
      if (habitData.createdBy !== user.uid) {
        throw new Error('You do not have permission to lock this habit');
      }
      
      // Check if the habit is already locked
      if (habitData.locked) {
        throw new Error('This habit is already locked');
      }
      
      await updateDoc(habitRef, { 
        locked: true,
        updatedAt: new Date()
      });
      
      // Update the habits list
      const habits = get().habits.map(habit => 
        habit.id === id ? { ...habit, locked: true, updatedAt: new Date() } : habit
      );
      
      // Update selected habit if it's the one being locked
      const selectedHabit = get().selectedHabit;
      if (selectedHabit && selectedHabit.id === id) {
        set({ selectedHabit: { ...selectedHabit, locked: true, updatedAt: new Date() } });
      }
      
      set({ habits, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchGoals: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      const goalsQuery = query(
        collection(db, 'goals'),
        where('createdBy', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const goalsSnapshot = await getDocs(goalsQuery);
      
      const goals: Goal[] = [];
      
      goalsSnapshot.forEach(doc => {
        const goalData = doc.data();
        goals.push({
          ...goalData,
          id: doc.id,
          targetDate: goalData.targetDate ? goalData.targetDate.toDate() : undefined,
          createdAt: goalData.createdAt.toDate(),
          updatedAt: goalData.updatedAt.toDate()
        } as Goal);
      });
      
      set({ goals, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchGoal: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const goalDoc = await getDoc(doc(db, 'goals', id));
      
      if (goalDoc.exists()) {
        const goalData = goalDoc.data();
        set({ 
          selectedGoal: {
            ...goalData,
            id: goalDoc.id,
            targetDate: goalData.targetDate ? goalData.targetDate.toDate() : undefined,
            createdAt: goalData.createdAt.toDate(),
            updatedAt: goalData.updatedAt.toDate()
          } as Goal,
          loading: false 
        });
      } else {
        set({ error: 'Goal not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createGoal: async (data: Partial<Goal>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const goalId = data.id || uuidv4();
      const now = new Date();
      
      const newGoal: Goal = {
        id: goalId,
        name: data.name || 'New Goal',
        description: data.description,
        targetDate: data.targetDate,
        progress: data.progress || 0,
        target: data.target || 100,
        unit: data.unit || '%',
        category: data.category || 'Personal',
        color: data.color || '#4f46e5', // Default indigo
        relatedHabits: data.relatedHabits || [],
        locked: data.locked || false,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        completed: data.completed || false
      };
      
      await setDoc(doc(db, 'goals', goalId), {
        ...newGoal,
        targetDate: newGoal.targetDate,
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { goals } = get();
      set({ 
        goals: [newGoal, ...goals],
        selectedGoal: newGoal,
        loading: false 
      });
      
      return goalId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateGoal: async (id: string, data: Partial<Goal>) => {
    try {
      set({ loading: true, error: null });
      
      const goalRef = doc(db, 'goals', id);
      const now = new Date();
      
      await updateDoc(goalRef, {
        ...data,
        targetDate: data.targetDate,
        updatedAt: now
      });
      
      // Update local state
      const { goals, selectedGoal } = get();
      const updatedGoals = goals.map(goal => 
        goal.id === id ? { ...goal, ...data, updatedAt: now } : goal
      );
      
      set({ 
        goals: updatedGoals,
        selectedGoal: selectedGoal?.id === id 
          ? { ...selectedGoal, ...data, updatedAt: now } 
          : selectedGoal,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteGoal: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'goals', id));
      
      // Update local state
      const { goals } = get();
      set({ 
        goals: goals.filter(goal => goal.id !== id),
        selectedGoal: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  updateGoalProgress: async (id: string, progress: number) => {
    try {
      const { goals } = get();
      const goal = goals.find(g => g.id === id);
      
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      // Check if goal is completed
      const completed = progress >= goal.target;
      
      await get().updateGoal(id, { 
        progress, 
        completed,
        updatedAt: new Date()
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  toggleGoalLock: async (id: string) => {
    try {
      const { goals } = get();
      const goal = goals.find(g => g.id === id);
      
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      await get().updateGoal(id, { locked: !goal.locked });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  
  getHabitStreak: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return 0;
    
    // Sort entries by date (newest first)
    const sortedEntries = [...habit.entries]
      .filter(entry => entry.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedEntries.length === 0) return 0;
    
    let streak = 1;
    let currentDate = new Date(sortedEntries[0].date);
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if the most recent entry is today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (currentDate.getTime() !== today.getTime() && 
        currentDate.getTime() !== yesterday.getTime()) {
      // Streak is broken if most recent entry is not today or yesterday
      return 0;
    }
    
    // Calculate streak by checking consecutive days
    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }
    
    return streak;
  },
  
  getCompletionRate: (habitId: string, days = 30) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    
    if (!habit) return 0;
    
    // Calculate date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Filter entries within date range
    const entriesInRange = habit.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= startDate && entryDate <= endDate;
    });
    
    // Count days in range where the habit should be performed
    let daysToPerform = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      
      if (habit.frequency[dayName as keyof typeof habit.frequency]) {
        daysToPerform++;
      }
    }
    
    if (daysToPerform === 0) return 0;
    
    // Count completed entries
    const completedEntries = entriesInRange.filter(entry => entry.completed).length;
    
    return (completedEntries / daysToPerform) * 100;
  },
  
  clearError: () => set({ error: null }),
}));
