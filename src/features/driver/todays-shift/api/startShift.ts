import { api } from '@/services/api'
import type { Shift } from '../types/shift.types'

export async function startShift(): Promise<{ message: string; shift: Shift }> {
  const { data } = await api.post<{ message: string; shift: Shift }>(
    '/driver/shift/start',
  )
  return data
}
