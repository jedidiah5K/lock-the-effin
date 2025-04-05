import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  initialized: false,

  register: async (email, password, displayName) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const newProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),
        theme: 'light',
      };
      
      await setDoc(doc(db, 'users', user.uid), newProfile);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists, if not create one
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        const newProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          theme: 'light',
        };
        
        await setDoc(doc(db, 'users', user.uid), newProfile);
      }
      
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ loading: true, error: null });
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      
      // Update local profile state
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        set({ profile: userDoc.data(), loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Initialize auth state listener
onAuthStateChanged(auth, async (user) => {
  const store = useAuthStore.getState();
  
  if (user) {
    try {
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        useAuthStore.setState({ 
          user, 
          profile: userDoc.data(),
          loading: false,
          initialized: true
        });
      } else {
        // If profile doesn't exist (rare case), create one
        const newProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          theme: 'light',
        };
        
        await setDoc(doc(db, 'users', user.uid), newProfile);
        useAuthStore.setState({ 
          user, 
          profile: newProfile,
          loading: false,
          initialized: true
        });
      }
    } catch (error) {
      useAuthStore.setState({ 
        error: error.message, 
        loading: false,
        initialized: true
      });
    }
  } else {
    useAuthStore.setState({ 
      user: null, 
      profile: null, 
      loading: false,
      initialized: true
    });
  }
});
