import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { getAllocations } from '../api/getAllocations'
import { allocationKeys } from '@/constants/keys'
import type { AllocationFilters } from '../types'

export function useAllocations(filters: AllocationFilters = {}) {
  const queryFilters = {
    pageSize: 1000,
    ...filters,
  }

  return useQuery({
    queryKey: [...allocationKeys.all, queryFilters],
    queryFn: () => getAllocations(queryFilters),
    placeholderData: keepPreviousData,
  })
}
