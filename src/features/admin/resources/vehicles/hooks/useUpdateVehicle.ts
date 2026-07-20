import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateVehicle } from '../api/updateVehicle'
import { vehicleKeys } from '@/constants/keys.ts'

export function useUpdateVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateVehicle,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      })
    },
  })
}
