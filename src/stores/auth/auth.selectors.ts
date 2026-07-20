import { useAuthStore } from './auth.store'

// export const useAuthUser = () => useAuthStore((s) => s.user)

export const useAuthenticated = () => useAuthStore((s) => s.user !== null)

export const useUserRole = () => useAuthStore((s) => s.user?.role ?? null)
