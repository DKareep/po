import { api } from '@/services/api'
import type { CreateHubInput } from '../schema/hub.schema'

export interface UpdateHubPayload extends CreateHubInput {
  id: string
}

export async function updateHub({
  id,
  name,
  address,
  lat,
  lng,
}: UpdateHubPayload) {
  const formattedPayload = {
    name,
    address,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  }
  const { data } = await api.put(`/hubs/${id}`, formattedPayload)

  return data
}
