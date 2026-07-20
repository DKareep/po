interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface VehiclesResponse {
  data: Vehicle[]
  pagination: Pagination
}

export interface VehicleFilters {
  search?: string
  type?: string
  pageSize: number
  status?: string
}

const VehicleStatus = {
  AVAILABLE: 'AVAILABLE',
  ALLOCATED: 'ALLOCATED',
  IN_TRANSIT: 'IN_TRANSIT',
  MAINTENANCE: 'MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
} as const

type VehicleStatus = (typeof VehicleStatus)[keyof typeof VehicleStatus]

export const VehicleType = {
  LIGHT_TANKER: 'Light Tanker',
  TANKER: 'Tanker',
  HEAVY_TANKER: 'Heavy Tanker',
  SEMI_TANKER: 'Semi-Tanker',
  DOUBLE_TANKER: 'Double Tanker',
  SUPER_TANKER: 'Super Tanker',
} as const

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType]

export interface Vehicle {
  id: string
  registration: string
  type: VehicleType
  capacity: number
  driver: string
  status: VehicleStatus
}
