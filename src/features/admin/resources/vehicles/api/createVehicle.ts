import { api } from '@/services/api'

import type { CreateVehicleInput } from '../schema/vehicle.schema'

export async function createVehicle(payload: CreateVehicleInput) {
  const { data } = await api.post('/vehicles', payload)

  return data
}
