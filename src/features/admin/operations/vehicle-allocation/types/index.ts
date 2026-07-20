export interface Allocation {
  id: string
  vehicleId: string
  driverId: string
  date: string
  vehicleDetails: {
    id: string
    registration: string
    capacity: number
    type: string
  } | null
  driverDetails: {
    id: string
    name: string
    license: string
    phone: string
  } | null
}

interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface AllocationsResponse {
  data: Allocation[]
  pagination: Pagination
}

export interface AllocationFilters {
  date?: string
  driverId?: string
  vehicleId?: string
  pageSize?: number
  page?: number
}

export interface CreateAllocationParams {
  vehicleId: string
  driverId: string
  date: string
}

export interface UpdateAllocationParams {
  id: string
  vehicleId?: string
  driverId?: string
  date?: string
}
