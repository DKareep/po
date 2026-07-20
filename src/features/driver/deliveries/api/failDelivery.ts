import { api } from '@/services/api'
import type { DriverOrder } from '../../todays-shift/types/shift.types'

export interface FailDeliveryResponse {
  message: string
  order: DriverOrder
}

export interface FailDeliveryParams {
  id: string
  reason: string
}

export async function failDelivery({
  id,
  reason,
}: FailDeliveryParams): Promise<FailDeliveryResponse> {
  const { data } = await api.put<FailDeliveryResponse>(
    `/driver/orders/${id}/fail`,
    {
      reason,
    },
  )
  return data
}
