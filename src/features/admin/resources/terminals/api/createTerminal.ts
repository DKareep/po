import { api } from '@/services/api'
import type { CreateTerminalInput } from '../schema/terminal.schema'

export async function createTerminal(payload: CreateTerminalInput) {
  const { name, address, lat, lng } = payload
  const formattedPayload = {
    name,
    address,
    coordinates:
      lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  }
  const { data } = await api.post('/terminals', formattedPayload)

  return data
}
