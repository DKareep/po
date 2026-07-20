import { api } from '@/services/api'
import type { Allocation, CreateAllocationParams } from '../types'

interface CreateAllocationResponse {
  message: string
  allocation: Allocation
}

export async function createAllocation(
  payload: CreateAllocationParams,
): Promise<CreateAllocationResponse> {
  const { data } = await api.post<CreateAllocationResponse>(
    '/allocations',
    payload,
  )
  return data
}
