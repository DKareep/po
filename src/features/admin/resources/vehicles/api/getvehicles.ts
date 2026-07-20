import { api } from '@/services/api'
import type { VehicleFilters, VehiclesResponse } from '../types'

interface GetVehiclesParams extends VehicleFilters {
  page: number
}

export async function getVehicles(
  params: GetVehiclesParams,
): Promise<VehiclesResponse> {
  const { data } = await api.get<VehiclesResponse>('/vehicles', {
    params,
  })

  return data
}
