import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbSignUp, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if a valid config exists
const hasConfig = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

let app;
let auth: any = null;
let firestore: any = null;
let isDemoMode = true;

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    isDemoMode = false;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to Demo Mode.", error);
    isDemoMode = true;
  }
} else {
  console.log("No Firebase credentials found. Running in Demo Mode.");
  isDemoMode = true;
}

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type AuthCallback = (user: AuthUser | null) => void;

// Simple event emitter for mock auth state changes
const mockAuthListeners: Set<AuthCallback> = new Set();
let mockCurrentUser: AuthUser | null = null;

// Read initial mock session from localStorage
const storedUser = localStorage.getItem('wf_crm_demo_user');
if (storedUser) {
  try {
    mockCurrentUser = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem('wf_crm_demo_user');
  }
}

const triggerMockAuthChange = () => {
  mockAuthListeners.forEach(cb => cb(mockCurrentUser));
};

export const authService = {
  isDemo(): boolean {
    return isDemoMode;
  },

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (!isDemoMode && auth) {
      const credential = await fbSignIn(auth, email, password);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || email.split('@')[0],
      };
    } else {
      // Simulate validation
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      // Success simulation
      const user: AuthUser = {
        uid: 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
        email: email,
        displayName: email.split('@')[0].replace(/^\w/, c => c.toUpperCase()),
      };
      mockCurrentUser = user;
      localStorage.setItem('wf_crm_demo_user', JSON.stringify(user));
      triggerMockAuthChange();
      return user;
    }
  },

  async signUp(email: string, password: string): Promise<AuthUser> {
    if (!isDemoMode && auth) {
      const credential = await fbSignUp(auth, email, password);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        displayName: credential.user.displayName || email.split('@')[0],
      };
    } else {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }
      const user: AuthUser = {
        uid: 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
        email: email,
        displayName: email.split('@')[0].replace(/^\w/, c => c.toUpperCase()),
      };
      mockCurrentUser = user;
      localStorage.setItem('wf_crm_demo_user', JSON.stringify(user));
      triggerMockAuthChange();
      return user;
    }
  },

  async signOut(): Promise<void> {
    if (!isDemoMode && auth) {
      await fbSignOut(auth);
    } else {
      mockCurrentUser = null;
      localStorage.removeItem('wf_crm_demo_user');
      triggerMockAuthChange();
    }
  },

  onAuthStateChange(callback: AuthCallback): () => void {
    if (!isDemoMode && auth) {
      const unsubscribe = fbOnAuthStateChanged(auth, (user: FirebaseUser | null) => {
        if (user) {
          callback({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          });
        } else {
          callback(null);
        }
      });
      return unsubscribe;
    } else {
      mockAuthListeners.add(callback);
      // Immediately call with current value
      callback(mockCurrentUser);
      return () => {
        mockAuthListeners.delete(callback);
      };
    }
  },

  getCurrentUser(): AuthUser | null {
    if (!isDemoMode && auth) {
      const user = auth.currentUser;
      if (!user) return null;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
      };
    } else {
      return mockCurrentUser;
    }
  }
};

export { auth, firestore };
