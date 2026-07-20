import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateLocationInventory } from '../api/updateLocationInventory'
import { hubKeys, terminalKeys } from '@/constants/keys'

export function useUpdateLocationInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLocationInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hubKeys.all })
      queryClient.invalidateQueries({ queryKey: terminalKeys.all })
    },
  })
}
