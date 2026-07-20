import { useMutation, useQueryClient } from '@tanstack/react-query'
import { failDelivery } from '../api/failDelivery'

export function useFailDelivery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: failDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todaysShift'] })
    },
  })
}
