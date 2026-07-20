import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createHub } from '../api/createHub'
import { hubKeys } from '@/constants/keys.ts'

export function useCreateHub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHub,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hubKeys.all,
      })
    },
  })
}
