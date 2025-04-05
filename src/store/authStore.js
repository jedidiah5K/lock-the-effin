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

  register: async function(email, password, displayName) {
    try {
      set({ loading: true, error: null });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
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

  login: async function(email, password) {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  loginWithGoogle: async function() {
    try {
      set({ loading: true, error: null });
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
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

  logout: async function() {
    try {
      set({ loading: true, error: null });
      await signOut(auth);
      set({ user: null, profile: null, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async function(data) {
    try {
      const { user } = get();
      if (!user) throw new Error('No user logged in');
      
      set({ loading: true, error: null });
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        set({ profile: userDoc.data(), loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: function() {
    set({ error: null });
  },
}));

// Initialize auth state listener
onAuthStateChanged(auth, async function(user) {
  const store = useAuthStore.getState();
  
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        useAuthStore.setState({ 
          user, 
          profile: userDoc.data(),
          loading: false,
          initialized: true
        });
      } else {
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
