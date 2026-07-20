import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateGps, type UpdateGpsParams } from '../api/updateGps'

export function useUpdateGps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UpdateGpsParams) => updateGps(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysShift'] })
    },
  })
}
