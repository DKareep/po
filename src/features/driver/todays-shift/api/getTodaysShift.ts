import { api } from '@/services/api'
import type { TodaysShiftResponse } from '../types/shift.types'

export async function getTodaysShift(): Promise<TodaysShiftResponse> {
  const { data } = await api.get<TodaysShiftResponse>('/driver/shift/today')
  return data
}
