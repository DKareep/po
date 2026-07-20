import { api } from '@/services/api'
import type { CreateOrderInput } from '../schema/order.schema'

export async function createOrder(payload: CreateOrderInput) {
  const { data } = await api.post('/orders', payload)

  return data
}
