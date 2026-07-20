import { api } from '@/services/api'
import type { DriverOrder } from '../../todays-shift/types/shift.types'

export interface CompleteDeliveryResponse {
  message: string
  order: DriverOrder
  inventoryUpdated: {
    hubName: string
    product: string
    newStock: number | null
  }
}

export async function completeDelivery(
  id: string,
): Promise<CompleteDeliveryResponse> {
  const { data } = await api.put<CompleteDeliveryResponse>(
    `/driver/orders/${id}/complete`,
  )
  return data
}
