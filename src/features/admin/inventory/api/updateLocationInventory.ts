import { api } from '@/services/api'

interface UpdateInventoryParams {
  id: string
  type: 'hub' | 'terminal'
  name: string
  address: string
  lat?: number
  lng?: number
  inventory: {
    diesel: number
    petrol: number
    jet_a1: number
  }
}

export async function updateLocationInventory({
  id,
  type,
  name,
  address,
  lat,
  lng,
  inventory,
}: UpdateInventoryParams) {
  const payload = {
    name,
    address,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
    inventory,
  }

  const endpoint = type === 'hub' ? `/hubs/${id}` : `/terminals/${id}`
  const { data } = await api.put(endpoint, payload)
  return data
}
