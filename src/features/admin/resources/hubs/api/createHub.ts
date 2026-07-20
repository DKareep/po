import { api } from '@/services/api'
import type { CreateHubInput } from '../schema/hub.schema'

export async function createHub(payload: CreateHubInput) {
  const { name, address, lat, lng } = payload
  const formattedPayload = {
    name,
    address,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  }
  const { data } = await api.post('/hubs', formattedPayload)

  return data
}
