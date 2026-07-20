import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createProduct } from '../api/createProduct'
import { productKeys } from '@/constants/keys.ts'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })
    },
  })
}
