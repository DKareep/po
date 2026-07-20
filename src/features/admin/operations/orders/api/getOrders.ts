import { api } from '@/services/api'
import type { OrderFilters, OrdersResponse } from '../types'

interface GetOrdersParams extends OrderFilters {
  page: number
}

export async function getOrders(
  params: GetOrdersParams,
): Promise<OrdersResponse> {
  const { data } = await api.get<OrdersResponse>('/orders', {
    params,
  })

  return data
}
