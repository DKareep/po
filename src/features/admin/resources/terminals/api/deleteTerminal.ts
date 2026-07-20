import { api } from '@/services/api'

export async function deleteTerminal(id: string) {
  const { data } = await api.delete(`/terminals/${id}`)

  return data
}
