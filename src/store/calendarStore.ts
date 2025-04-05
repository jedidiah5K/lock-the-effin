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

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay: boolean;
  location?: string;
  color: string;
  category?: string;
  noteId?: string;
  expenseId?: string;
  todoId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
}

interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  selectedDate: Date;
  view: 'month' | 'week' | 'day';
  loading: boolean;
  error: string | null;
  
  fetchEvents: (start?: Date, end?: Date) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (data: Partial<CalendarEvent>) => Promise<string>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  setView: (view: 'month' | 'week' | 'day') => void;
  clearError: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedEvent: null,
  selectedDate: new Date(),
  view: 'month',
  loading: false,
  error: null,
  
  fetchEvents: async (start, end) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      // Query events created by the user
      const eventsQuery = query(
        collection(db, 'events'),
        where('createdBy', '==', user.uid),
        orderBy('start', 'asc')
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      
      const events: CalendarEvent[] = [];
      
      eventsSnapshot.forEach(doc => {
        const eventData = doc.data();
        events.push({
          ...eventData,
          id: doc.id,
          start: eventData.start.toDate(),
          end: eventData.end.toDate(),
          createdAt: eventData.createdAt.toDate(),
          updatedAt: eventData.updatedAt.toDate(),
          recurrence: eventData.recurrence ? {
            ...eventData.recurrence,
            endDate: eventData.recurrence.endDate ? eventData.recurrence.endDate.toDate() : undefined
          } : undefined
        } as CalendarEvent);
      });
      
      // Filter events by date range if provided
      const filteredEvents = (start && end) 
        ? events.filter(event => event.start >= start && event.end <= end)
        : events;
      
      set({ events: filteredEvents, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchEvent: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const eventDoc = await getDoc(doc(db, 'events', id));
      
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        set({ 
          selectedEvent: {
            ...eventData,
            id: eventDoc.id,
            start: eventData.start.toDate(),
            end: eventData.end.toDate(),
            createdAt: eventData.createdAt.toDate(),
            updatedAt: eventData.updatedAt.toDate(),
            recurrence: eventData.recurrence ? {
              ...eventData.recurrence,
              endDate: eventData.recurrence.endDate ? eventData.recurrence.endDate.toDate() : undefined
            } : undefined
          } as CalendarEvent,
          loading: false 
        });
      } else {
        set({ error: 'Event not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createEvent: async (data: Partial<CalendarEvent>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const eventId = data.id || uuidv4();
      const now = new Date();
      
      const newEvent: CalendarEvent = {
        id: eventId,
        title: data.title || 'Untitled Event',
        description: data.description,
        start: data.start || now,
        end: data.end || new Date(now.getTime() + 60 * 60 * 1000), // Default 1 hour
        allDay: data.allDay || false,
        location: data.location,
        color: data.color || '#4f46e5', // Default indigo
        category: data.category,
        noteId: data.noteId,
        expenseId: data.expenseId,
        todoId: data.todoId,
        createdBy: user.uid,
        createdAt: now,
        updatedAt: now,
        recurrence: data.recurrence
      };
      
      await setDoc(doc(db, 'events', eventId), {
        ...newEvent,
        start: newEvent.start,
        end: newEvent.end,
        createdAt: now,
        updatedAt: now,
        recurrence: newEvent.recurrence ? {
          ...newEvent.recurrence,
          endDate: newEvent.recurrence.endDate
        } : undefined
      });
      
      // Update local state
      const { events } = get();
      set({ 
        events: [...events, newEvent],
        selectedEvent: newEvent,
        loading: false 
      });
      
      return eventId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateEvent: async (id: string, data: Partial<CalendarEvent>) => {
    try {
      set({ loading: true, error: null });
      
      const eventRef = doc(db, 'events', id);
      const now = new Date();
      
      await updateDoc(eventRef, {
        ...data,
        updatedAt: now,
        start: data.start,
        end: data.end,
        recurrence: data.recurrence ? {
          ...data.recurrence,
          endDate: data.recurrence.endDate
        } : undefined
      });
      
      // Update local state
      const { events, selectedEvent } = get();
      const updatedEvents = events.map(event => 
        event.id === id ? { ...event, ...data, updatedAt: now } : event
      );
      
      set({ 
        events: updatedEvents,
        selectedEvent: selectedEvent?.id === id 
          ? { ...selectedEvent, ...data, updatedAt: now } 
          : selectedEvent,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteEvent: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'events', id));
      
      // Update local state
      const { events } = get();
      set({ 
        events: events.filter(event => event.id !== id),
        selectedEvent: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  },
  
  setView: (view: 'month' | 'week' | 'day') => {
    set({ view });
  },
  
  clearError: () => set({ error: null }),
}));
