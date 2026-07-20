import { api } from '@/services/api'
import type {
  ShiftHistoryFilters,
  ShiftHistoryResponse,
} from '../types/history.types'

export async function getShiftHistory(
  params: ShiftHistoryFilters,
): Promise<ShiftHistoryResponse> {
  const { data } = await api.get<ShiftHistoryResponse>(
    '/driver/shift/history',
    {
      params,
    },
  )
  return data
}
