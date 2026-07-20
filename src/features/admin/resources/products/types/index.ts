interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ProductsResponse {
  data: Product[]
  pagination: Pagination
}

export interface ProductFilters {
  search?: string
  pageSize: number
}

export interface Product {
  id: string
  name: string
  unit: string
}
