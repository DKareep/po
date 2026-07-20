import { api } from '@/services/api'

export interface UpdateGpsParams {
  lat: number
  lng: number
}

export interface UpdateGpsResponse {
  message: string
  gps: {
    driverId: string
    vehicleId: string | null
    lat: number
    lng: number
    updatedAt: string
  }
}

export async function updateGps(
  params: UpdateGpsParams,
): Promise<UpdateGpsResponse> {
  const { data } = await api.post<UpdateGpsResponse>('/driver/gps', params)
  return data
}
