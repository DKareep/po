import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateTerminal } from '../api/updateTerminal'
import { terminalKeys } from '@/constants/keys.ts'

export function useUpdateTerminal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTerminal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: terminalKeys.all,
      })
    },
  })
}
