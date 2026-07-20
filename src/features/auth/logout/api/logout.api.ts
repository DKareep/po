import { api } from '@/services/api'

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
