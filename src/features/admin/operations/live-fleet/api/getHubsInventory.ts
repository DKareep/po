import { api } from '@/services/api'

export interface HubInventoryItem {
  id: string
  name: string
  type: 'hub' | 'terminal'
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  inventory: Record<string, number>
  lowStockAlerts: Record<string, boolean>
  hasLowStock: boolean
}

export interface HubsInventoryResponse {
  threshold: number
  items: HubInventoryItem[]
}

export async function getHubsInventory(): Promise<HubsInventoryResponse> {
  const { data } = await api.get<HubsInventoryResponse>('/fleet/inventory')
  return data
}
