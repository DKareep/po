import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteVehicle } from '../api/deleteVehicle'
import { vehicleKeys } from '@/constants/keys.ts'

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteVehicle,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vehicleKeys.all,
      })
    },
  })
}
