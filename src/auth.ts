import { apiRequest } from './services/api';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type AuthCallback = (user: AuthUser | null) => void;

let currentUser: AuthUser | null = null;
let sessionLoaded = false;
let sessionRequest: Promise<void> | null = null;
const listeners = new Set<AuthCallback>();

function publish(user: AuthUser | null): void {
  currentUser = user;
  for (const listener of listeners) listener(user);
}

async function loadSession(): Promise<void> {
  if (sessionLoaded) return;
  if (!sessionRequest) {
    sessionRequest = apiRequest<{ user: AuthUser }>('/api/auth/session')
      .then(response => publish(response.user))
      .catch(() => publish(null))
      .finally(() => {
        sessionLoaded = true;
        sessionRequest = null;
      });
  }
  return sessionRequest;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthUser> {
    const response = await apiRequest<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    sessionLoaded = true;
    publish(response.user);
    return response.user;
  },

  async signOut(): Promise<void> {
    await apiRequest<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
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
