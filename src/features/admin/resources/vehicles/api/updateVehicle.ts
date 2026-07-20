import { api } from '@/services/api'

import type { CreateVehicleInput } from '../schema/vehicle.schema'

export interface UpdateVehiclePayload extends CreateVehicleInput {
  id: string
}

export async function updateVehicle({ id, ...payload }: UpdateVehiclePayload) {
  const { data } = await api.put(`/vehicles/${id}`, payload)

  return data
}
