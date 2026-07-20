import { api } from '@/services/api'
import type { AllocationFilters, AllocationsResponse } from '../types'

export async function getAllocations(
  params: AllocationFilters,
): Promise<AllocationsResponse> {
  const { data } = await api.get<AllocationsResponse>('/allocations', {
    params,
  })
  return data
}
