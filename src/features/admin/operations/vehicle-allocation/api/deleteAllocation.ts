import { api } from '@/services/api'

interface DeleteAllocationResponse {
  message: string
}

export async function deleteAllocation(
  id: string,
): Promise<DeleteAllocationResponse> {
  const { data } = await api.delete<DeleteAllocationResponse>(
    `/allocations/${id}`,
  )
  return data
}
