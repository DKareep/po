import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateProduct } from '../api/updateProduct'
import { productKeys } from '@/constants/keys.ts'

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      })
    },
  })
}
