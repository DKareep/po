import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { tokenStorage } from '@/lib/token-storage'
import { useAuthStore } from '@/stores/auth'

import { logout } from '../api/logout.api'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: logout,
    onError: () => {
      toast.error('Could not reach the server, signing you out locally')
    },
    onSettled: () => {
      tokenStorage.clear()
      useAuthStore.getState().clear()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
