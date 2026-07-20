import { api } from '@/services/api'

export async function deleteDriver(id: string) {
  const { data } = await api.delete(`/drivers/${id}`)

  return data
}
