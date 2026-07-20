import { api } from '@/services/api'

export interface LiveFleetResponseItem {
  allocationId: string
  date: string
  driver: {
    id: string
    name: string
    phone: string
  } | null
  vehicle: {
    id: string
    registration: string
    capacity: number
    type: string
  } | null
  shiftStatus: 'active' | 'ended' | 'inactive'
  gps: {
    lat: number
    lng: number
    updatedAt: string | null
    source: string
  }
  orders: {
    id: string
    destinationId: string
    product: string
    quantity: number
    status: 'assigned' | 'completed' | 'failed' | 'pending'
  }[]
}

export async function getLiveFleet(): Promise<LiveFleetResponseItem[]> {
  const { data } = await api.get<LiveFleetResponseItem[]>('/fleet/map')
  return data
}
