import { api } from '@/services/api'

export async function deleteHub(id: string) {
  const { data } = await api.delete(`/hubs/${id}`)

  return data
}
