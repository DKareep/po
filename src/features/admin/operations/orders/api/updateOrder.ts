import { api } from '@/services/api'
import type { CreateOrderInput } from '../schema/order.schema'

export interface UpdateOrderPayload extends Partial<CreateOrderInput> {
  id: string
  status?: string
}

export async function updateOrder({ id, ...payload }: UpdateOrderPayload) {
  const { data } = await api.put(`/orders/${id}`, payload)

  return data
}
