import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { LoginUser } from '@/features/auth/login/types/login.types'

export interface AuthState {
  user: LoginUser | null
  setAuth: (user: LoginUser) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
