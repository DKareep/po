import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateDriver } from '../api/updateDriver'
import { driverKeys } from '@/constants/keys.ts'

export function useUpdateDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateDriver,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: driverKeys.all,
      })
    },
  })
}
