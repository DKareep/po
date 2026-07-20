import { api } from '@/services/api'
import type { CreateTerminalInput } from '../schema/terminal.schema'

export interface UpdateTerminalPayload extends CreateTerminalInput {
  id: string
}

export async function updateTerminal({
  id,
  name,
  address,
  lat,
  lng,
}: UpdateTerminalPayload) {
  const formattedPayload = {
    name,
    address,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  }
  const { data } = await api.put(`/terminals/${id}`, formattedPayload)

  return data
}
