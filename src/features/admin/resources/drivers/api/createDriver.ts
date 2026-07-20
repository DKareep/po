import { api } from '@/services/api'
import type { CreateDriverInput } from '../schema/driver.schema'

export async function createDriver(payload: CreateDriverInput) {
  const { data } = await api.post('/drivers', payload)

  return data
}
