import { useQuery } from '@tanstack/react-query'
import { getShiftHistory } from '../api/getShiftHistory'
import type { ShiftHistoryFilters } from '../types/history.types'

export function useShiftHistory(filters: ShiftHistoryFilters) {
  return useQuery({
    queryKey: ['shiftHistory', filters],
    queryFn: () => getShiftHistory(filters),
  })
}
