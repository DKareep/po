import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateOrder } from '../api/updateOrder'
import { orderKeys } from '@/constants/keys.ts'

export function useUpdateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
    },
  })
}
