import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteProduct } from '../api/deleteProduct'
import { productKeys } from '@/constants/keys.ts'

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })
    },
  })
}
