import { api } from '@/services/api'
import type { HubFilters, HubsResponse } from '../types'

interface GetHubsParams extends HubFilters {
  page: number
}

export async function getHubs(params: GetHubsParams): Promise<HubsResponse> {
  const { data } = await api.get<HubsResponse>('/hubs', {
    params,
  })

  return data
}
