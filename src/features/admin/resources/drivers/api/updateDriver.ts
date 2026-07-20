import { api } from '@/services/api'
import type { CreateDriverInput } from '../schema/driver.schema'

export interface UpdateDriverPayload extends CreateDriverInput {
  id: string
}

export async function updateDriver({ id, ...payload }: UpdateDriverPayload) {
  const { data } = await api.put(`/drivers/${id}`, payload)

  return data
}
