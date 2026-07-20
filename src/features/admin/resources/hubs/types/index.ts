interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface HubsResponse {
  data: Hub[]
  pagination: Pagination
}

export interface HubFilters {
  search?: string
  pageSize: number
}

export interface Hub {
  id: string
  name: string
  address: string
  type: 'hub' | 'terminal'
  coordinates?: {
    lat: number
    lng: number
  }
  inventory?: Record<string, number>
}
