import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createTerminal } from '../api/createTerminal'
import { terminalKeys } from '@/constants/keys.ts'

export function useCreateTerminal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTerminal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: terminalKeys.all,
      })
    },
  })
}
