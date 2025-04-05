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

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'checklist' | 'image' | 'code' | 'table';
  content: any;
  children?: Block[];
}

export interface Note {
  id: string;
  title: string;
  emoji?: string;
  content: Block[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  collaborators: string[];
  favorite: boolean;
  tags: string[];
}

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  loading: boolean;
  error: string | null;
  
  fetchNotes: () => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (data: Partial<Note>) => Promise<string>;
  updateNote: (id: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addCollaborator: (noteId: string, userId: string) => Promise<void>;
  removeCollaborator: (noteId: string, userId: string) => Promise<void>;
  clearError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  
  fetchNotes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    
    try {
      set({ loading: true, error: null });
      
      // Query notes created by the user
      const createdByQuery = query(
        collection(db, 'notes'),
        where('createdBy', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      // Query notes where user is a collaborator
      const collaboratorQuery = query(
        collection(db, 'notes'),
        where('collaborators', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );
      
      const [createdBySnapshot, collaboratorSnapshot] = await Promise.all([
        getDocs(createdByQuery),
        getDocs(collaboratorQuery)
      ]);
      
      // Combine and deduplicate notes
      const notesMap = new Map();
      
      createdBySnapshot.forEach(doc => {
        const noteData = doc.data();
        notesMap.set(doc.id, {
          ...noteData,
          id: doc.id,
          createdAt: noteData.createdAt.toDate(),
          updatedAt: noteData.updatedAt.toDate()
        });
      });
      
      collaboratorSnapshot.forEach(doc => {
        if (!notesMap.has(doc.id)) {
          const noteData = doc.data();
          notesMap.set(doc.id, {
            ...noteData,
            id: doc.id,
            createdAt: noteData.createdAt.toDate(),
            updatedAt: noteData.updatedAt.toDate()
          });
        }
      });
      
      set({ 
        notes: Array.from(notesMap.values()) as Note[],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  fetchNote: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const noteDoc = await getDoc(doc(db, 'notes', id));
      
      if (noteDoc.exists()) {
        const noteData = noteDoc.data();
        set({ 
          currentNote: {
            ...noteData,
            id: noteDoc.id,
            createdAt: noteData.createdAt.toDate(),
            updatedAt: noteData.updatedAt.toDate()
          } as Note,
          loading: false 
        });
      } else {
        set({ error: 'Note not found', loading: false });
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  createNote: async (data: Partial<Note>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not authenticated');
    
    try {
      set({ loading: true, error: null });
      
      const noteId = data.id || uuidv4();
      const now = new Date();
      
      const newNote: Note = {
        id: noteId,
        title: data.title || 'Untitled',
        emoji: data.emoji,
        content: data.content || [{ 
          id: uuidv4(), 
          type: 'paragraph', 
          content: '' 
        }],
        parentId: data.parentId,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        collaborators: data.collaborators || [],
        favorite: data.favorite || false,
        tags: data.tags || []
      };
      
      await setDoc(doc(db, 'notes', noteId), {
        ...newNote,
        createdAt: now,
        updatedAt: now
      });
      
      // Update local state
      const { notes } = get();
      set({ 
        notes: [newNote, ...notes],
        currentNote: newNote,
        loading: false 
      });
      
      return noteId;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  
  updateNote: async (id: string, data: Partial<Note>) => {
    try {
      set({ loading: true, error: null });
      
      const noteRef = doc(db, 'notes', id);
      const now = new Date();
      
      await updateDoc(noteRef, {
        ...data,
        updatedAt: now
      });
      
      // Update local state
      const { notes, currentNote } = get();
      const updatedNotes = notes.map(note => 
        note.id === id ? { ...note, ...data, updatedAt: now } : note
      );
      
      set({ 
        notes: updatedNotes,
        currentNote: currentNote?.id === id 
          ? { ...currentNote, ...data, updatedAt: now } 
          : currentNote,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  deleteNote: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'notes', id));
      
      // Update local state
      const { notes } = get();
      set({ 
        notes: notes.filter(note => note.id !== id),
        currentNote: null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  
  toggleFavorite: async (id: string) => {
    const { notes } = get();
    const note = notes.find(n => n.id === id);
    
    if (note) {
      const favorite = !note.favorite;
      await get().updateNote(id, { favorite });
    }
  },
  
  addCollaborator: async (noteId: string, userId: string) => {
    const { notes } = get();
    const note = notes.find(n => n.id === noteId);
    
    if (note && !note.collaborators.includes(userId)) {
      const collaborators = [...note.collaborators, userId];
      await get().updateNote(noteId, { collaborators });
    }
  },
  
  removeCollaborator: async (noteId: string, userId: string) => {
    const { notes } = get();
    const note = notes.find(n => n.id === noteId);
    
    if (note && note.collaborators.includes(userId)) {
      const collaborators = note.collaborators.filter(id => id !== userId);
      await get().updateNote(noteId, { collaborators });
    }
  },
  
  clearError: () => set({ error: null }),
}));
