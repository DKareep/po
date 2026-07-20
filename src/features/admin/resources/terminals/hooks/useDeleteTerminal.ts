import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteTerminal } from '../api/deleteTerminal'
import { terminalKeys } from '@/constants/keys.ts'

export function useDeleteTerminal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTerminal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: terminalKeys.all,
      })
    },
  })
}
