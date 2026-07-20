import { api } from '@/services/api'
import type { Shift } from '../types/shift.types'

export async function endShift(): Promise<{ message: string; shift: Shift }> {
  const { data } = await api.post<{ message: string; shift: Shift }>(
    '/driver/shift/end',
  )
  return data
}
