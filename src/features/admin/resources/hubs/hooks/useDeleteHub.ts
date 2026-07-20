import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteHub } from '../api/deleteHub'
import { hubKeys } from '@/constants/keys.ts'

export function useDeleteHub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHub,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hubKeys.all,
      })
    },
  })
}
