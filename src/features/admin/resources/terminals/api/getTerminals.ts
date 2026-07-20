import { api } from '@/services/api'
import type { TerminalFilters, TerminalsResponse } from '../types'

interface GetTerminalsParams extends TerminalFilters {
  page: number
}

export async function getTerminals(
  params: GetTerminalsParams,
): Promise<TerminalsResponse> {
  const { data } = await api.get<TerminalsResponse>('/terminals', {
    params,
  })

  return data
}
