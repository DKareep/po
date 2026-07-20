import { api } from '@/services/api'
import type { Allocation, UpdateAllocationParams } from '../types'

interface UpdateAllocationResponse {
  message: string
  allocation: Allocation
}

export async function updateAllocation({
  id,
  ...payload
}: UpdateAllocationParams): Promise<UpdateAllocationResponse> {
  const { data } = await api.put<UpdateAllocationResponse>(
    `/allocations/${id}`,
    payload,
  )
  return data
}
