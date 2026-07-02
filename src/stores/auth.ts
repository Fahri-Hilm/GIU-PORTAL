'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile } from '@/lib/types';
import { data, mockSignIn, mockSignOut } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthState {
  user: Profile | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,
      init: async () => {
        if (isSupabaseConfigured) {
          const user = await data.getCurrentUser();
          set({ user, initialized: true });
        } else {
          set({ initialized: true });
        }
      },
      signIn: async (email, password) => {
        set({ loading: true });
        try {
          const user = await mockSignIn(email, password);
          set({ user, loading: false });
        } catch (e) {
          set({ loading: false });
          throw e;
        }
      },
      signOut: async () => {
        await mockSignOut();
        set({ user: null });
      },
    }),
    {
      name: 'giu-auth',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (undefined as never))),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
