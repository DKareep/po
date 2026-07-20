import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startShift } from '../api/startShift'

export function useStartShift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysShift'] })
    },
  })
}
