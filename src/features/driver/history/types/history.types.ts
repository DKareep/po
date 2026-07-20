interface ShiftHistoryItem {
  id: string
  date: string
  status: 'active' | 'ended'
  startedAt: string
  endedAt: string | null
  vehicleRegistration: string
  vehicleType: string | null
  stats: {
    totalDeliveries: number
    completedDeliveries: number
    failedDeliveries: number
  }
}

interface PaginationMetadata {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ShiftHistoryResponse {
  data: ShiftHistoryItem[]
  pagination: PaginationMetadata
}

export interface ShiftHistoryFilters {
  page: number
  pageSize: number
}
