import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateHub } from '../api/updateHub'
import { hubKeys } from '@/constants/keys.ts'

export function useUpdateHub() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateHub,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hubKeys.all,
      })
    },
  })
}
