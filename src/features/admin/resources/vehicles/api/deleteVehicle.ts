import { api } from '@/services/api'

export async function deleteVehicle(id: string) {
  const { data } = await api.delete(`/vehicles/${id}`)

  return data
}
