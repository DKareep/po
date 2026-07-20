import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { tokenStorage } from '@/lib/token-storage'
import { useAuthStore } from '@/stores/auth'

import { login } from '../api/login.api'
import type { LoginRequest, LoginResponse } from '../types/login.types'

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      tokenStorage.set(data.token)
      useAuthStore.getState().setAuth(data.user)
    },
    onError: () => {
      toast.error('Something went wrong, try again')
    },
  })
}
