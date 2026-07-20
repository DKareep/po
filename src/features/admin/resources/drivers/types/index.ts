interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface DriversResponse {
  data: Driver[]
  pagination: Pagination
}

export interface DriverFilters {
  search?: string
  pageSize: number
}

export interface Driver {
  id: string
  name: string
  license: string
  phone: string
}
