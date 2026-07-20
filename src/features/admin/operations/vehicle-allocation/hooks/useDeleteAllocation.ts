import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAllocation } from '../api/deleteAllocation'
import { allocationKeys } from '@/constants/keys'

export function useDeleteAllocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: allocationKeys.all,
      })
    },
  })
}
