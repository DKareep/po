import { api } from '@/services/api'

export async function deleteOrder(id: string) {
  const { data } = await api.delete(`/orders/${id}`)

  return data
}
