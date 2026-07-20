import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createVehicle } from '../api/createVehicle'
import { vehicleKeys } from '@/constants/keys.ts'

export function useCreateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createVehicle,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      })
    },
  })
}
