import { useMutation, useQueryClient } from '@tanstack/react-query'
import { completeDelivery } from '../api/completeDelivery'

export function useCompleteDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: completeDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysShift'] })
    },
  })
}
