import { useMutation, useQueryClient } from '@tanstack/react-query'
import { endShift } from '../api/endShift'

export function useEndShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: endShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysShift'] })
    },
  })
}
