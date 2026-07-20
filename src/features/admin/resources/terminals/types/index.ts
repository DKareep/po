interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface TerminalsResponse {
  data: Terminal[]
  pagination: Pagination
}

export interface TerminalFilters {
  search?: string
  pageSize: number
}

export interface Terminal {
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
