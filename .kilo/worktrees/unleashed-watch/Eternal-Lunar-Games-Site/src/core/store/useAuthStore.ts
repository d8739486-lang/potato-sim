// Browser-only authentication — no external services, no IP checks, no API keys.
// The admin password is stored hashed in localStorage. Users are anonymous.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { realtime } from '../services/realtime';

const ADMIN_PASSWORD_HASH_KEY = 'eternal_admin_hash';
const SESSION_KEY = 'eternal_session';
const DEFAULT_ADMIN_PASSWORD = 'eternal2025'; // Initial password — change after first login

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '__eternal_lunar_salt__');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === storedHash;
}

async function initAdminPassword(): Promise<void> {
  const existing = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
  if (!existing) {
    const hash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, hash);
  }
}

export interface AuthState {
  username: string | null;
  role: 'user' | 'admin' | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  loginAsAnonymous: (username: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  changeAdminPassword: (newPassword: string) => Promise<void>;
  resetAdminPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      username: null,
      role: null,
      isAuthenticated: false,
      isHydrated: false,

      login: async (desiredUsername: string, password?: string) => {
        await initAdminPassword();

        const currentUsername = desiredUsername.trim();

        // Admin login
        if (currentUsername.toLowerCase() === 'eternal_lunar') {
          if (!password) {
            realtime.sendNotification({
              title: 'Ошибка входа',
              body: 'Введите пароль администратора.',
            });
            return false;
          }

          const storedHash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
          if (!storedHash) return false;

          const isValid = await verifyPassword(password, storedHash);
          if (!isValid) {
            realtime.sendNotification({
              title: 'Ошибка входа',
              body: 'Неверный пароль администратора!',
            });
            return false;
          }

          // Set session
          const session = { username: 'Eternal_Lunar', role: 'admin', expiresAt: Date.now() + 7 * 24 * 3600000 };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          set({ username: 'Eternal_Lunar', role: 'admin', isAuthenticated: true });

          realtime.broadcast({ type: 'auth', action: 'auth_state', data: { username: 'Eternal_Lunar', role: 'admin' }, timestamp: Date.now() });
          return true;
        }

        // Anonymous user login
        get().loginAsAnonymous(currentUsername);
        return true;
      },

      loginAsAnonymous: (username: string) => {
        const safeName = username.trim() || 'User';
        // Check if taken by another anonymous user in same session
        let finalName = safeName;
        let counter = 1;
        while (finalName.toLowerCase() === 'eternal_lunar' || finalName.toLowerCase() === 'admin') {
          finalName = `${safeName}_${counter++}`;
        }

        const session = { username: finalName, role: 'user', expiresAt: Date.now() + 24 * 3600000 };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        set({ username: finalName, role: 'user', isAuthenticated: true });

        realtime.broadcast({ type: 'auth', action: 'auth_state', data: { username: finalName, role: 'user' }, timestamp: Date.now() });
      },

      logout: () => {
        sessionStorage.removeItem(SESSION_KEY);
        set({ username: null, role: null, isAuthenticated: false });
        realtime.broadcast({ type: 'auth', action: 'auth_state', data: { username: null, role: null }, timestamp: Date.now() });
      },

      checkAuth: async () => {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          try {
            const session = JSON.parse(raw);
            if (session.expiresAt > Date.now()) {
              set({ username: session.username, role: session.role, isAuthenticated: true });
            } else {
              sessionStorage.removeItem(SESSION_KEY);
            }
          } catch {
            sessionStorage.removeItem(SESSION_KEY);
          }
        }
        set({ isHydrated: true });
      },

      changeAdminPassword: async (newPassword: string) => {
        const hash = await hashPassword(newPassword);
        localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, hash);
        realtime.sendNotification({ title: 'Пароль изменён', body: 'Новый пароль администратора сохранён.' });
      },

      resetAdminPassword: async (currentPassword: string, newPassword: string) => {
        const storedHash = localStorage.getItem(ADMIN_PASSWORD_HASH_KEY);
        if (!storedHash) return false;
        const isValid = await verifyPassword(currentPassword, storedHash);
        if (!isValid) return false;
        const hash = await hashPassword(newPassword);
        localStorage.setItem(ADMIN_PASSWORD_HASH_KEY, hash);
        return true;
      },
    }),
    { name: 'eternal-auth-storage' }
  )
);

// Initialize auth state on module load
useAuthStore.getState().checkAuth();
