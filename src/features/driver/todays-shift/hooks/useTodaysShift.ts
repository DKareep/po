import { useQuery } from '@tanstack/react-query'
import { getTodaysShift } from '../api/getTodaysShift'

export function useTodaysShift() {
  return useQuery({
    queryKey: ['todaysShift'],
    queryFn: getTodaysShift,
    refetchInterval: 15000, // optionally poll every 15 seconds to fetch latest updates/assignments
  })
}
