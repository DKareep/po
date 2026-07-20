import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAllocation } from '../api/updateAllocation'
import { allocationKeys } from '@/constants/keys'

export function useUpdateAllocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.all,
      })
    },
  })
}
