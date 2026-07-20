import { api } from '@/services/api'
import type { DriverFilters, DriversResponse } from '../types'

interface GetDriversParams extends DriverFilters {
  page: number
}

export async function getDrivers(
  params: GetDriversParams,
): Promise<DriversResponse> {
  const { data } = await api.get<DriversResponse>('/drivers', {
    params,
  })

  return data
}
