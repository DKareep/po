import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAllocation } from '../api/createAllocation'
import { allocationKeys } from '@/constants/keys'

export function useCreateAllocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.all,
      })
    },
  })
}
