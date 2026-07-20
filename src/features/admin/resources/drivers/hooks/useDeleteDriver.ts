import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteDriver } from '../api/deleteDriver'
import { driverKeys } from '@/constants/keys.ts'

export function useDeleteDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDriver,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      })
    },
  })
}
