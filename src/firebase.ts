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

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type AuthCallback = (user: AuthUser | null) => void;

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const credential = await fbSignIn(auth, email, password);
    return {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName || email.split('@')[0],
    };
  },

  async signUp(email: string, password: string): Promise<AuthUser> {
    const credential = await fbSignUp(auth, email, password);
    return {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName: credential.user.displayName || email.split('@')[0],
    };
  },

  async signOut(): Promise<void> {
    await fbSignOut(auth);
  },

  onAuthStateChange(callback: AuthCallback): () => void {
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
  },

  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
    };
  }
};

export { auth, firestore };
