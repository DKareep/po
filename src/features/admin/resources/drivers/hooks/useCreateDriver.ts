import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createDriver } from '../api/createDriver'
import { driverKeys } from '@/constants/keys.ts'

export function useCreateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createDriver,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      })
    },
  })
}
