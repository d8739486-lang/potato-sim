import { create } from 'zustand';
import type { Profile } from '../../core/supabase';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isLoading: true,

  setProfile: (profile) =>
    set({
      profile,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
