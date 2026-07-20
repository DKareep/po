import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteOrder } from '../api/deleteOrder'
import { orderKeys } from '@/constants/keys.ts'

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
    },
  })
}
