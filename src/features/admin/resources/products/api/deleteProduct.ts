import { api } from '@/services/api'

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/products/${id}`)

  return data
}
