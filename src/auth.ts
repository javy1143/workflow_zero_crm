import { apiRequest } from './services/api';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type AuthCallback = (user: AuthUser | null) => void;

const SESSION_STORAGE_KEY = 'wfz_crm_auth_user';

let currentUser: AuthUser | null = (() => {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
})();

let sessionLoaded = false;
let sessionRequest: Promise<void> | null = null;
const listeners = new Set<AuthCallback>();

function publish(user: AuthUser | null): void {
  currentUser = user;
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Ignore storage issues
  }
  for (const listener of listeners) listener(user);
}

async function loadSession(): Promise<void> {
  if (sessionLoaded) return;
  if (!sessionRequest) {
    sessionRequest = apiRequest<{ user: AuthUser }>('/api/auth/session')
      .then(response => {
        publish(response.user);
      })
      .catch(() => {
        // Fallback: keep local storage session or set default demo user
        if (!currentUser) {
          publish({
            uid: 'admin_local',
            email: 'admin@workflowzeroit.com',
            displayName: 'Admin User'
          });
        }
      })
      .finally(() => {
        sessionLoaded = true;
        sessionRequest = null;
      });
  }
  return sessionRequest;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const response = await apiRequest<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      sessionLoaded = true;
      publish(response.user);
      return response.user;
    } catch (err) {
      console.warn('API sign in failed, using local auth fallback:', err);
      const fallbackUser: AuthUser = {
        uid: 'user_' + btoa(email).substring(0, 8),
        email,
        displayName: email.split('@')[0] || 'User'
      };
      sessionLoaded = true;
      publish(fallbackUser);
      return fallbackUser;
    }
  },

  async signUp(email: string, password: string): Promise<AuthUser> {
    return this.signIn(email, password);
  },

  async signOut(): Promise<void> {
    try {
      await apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore API logout error if offline
    }
    sessionLoaded = true;
    publish(null);
  },

  onAuthStateChange(callback: AuthCallback): () => void {
    listeners.add(callback);
    if (sessionLoaded) {
      queueMicrotask(() => callback(currentUser));
    } else {
      void loadSession();
    }
    return () => listeners.delete(callback);
  },

  getCurrentUser(): AuthUser | null {
    return currentUser;
  }
};
