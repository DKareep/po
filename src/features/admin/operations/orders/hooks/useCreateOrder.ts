import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createOrder } from '../api/createOrder'
import { orderKeys } from '@/constants/keys.ts'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
    },
  })
}
