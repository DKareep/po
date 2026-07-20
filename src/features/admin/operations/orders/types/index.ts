interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface OrdersResponse {
  data: Order[]
  pagination: Pagination
}

export interface OrderFilters {
  status?: string
  date?: string
  destinationId?: string
  assignedDriverId?: string
  pageSize: number
}

type OrderStatus = 'pending' | 'assigned' | 'completed' | 'failed'

export interface Order {
  id: string
  destinationId: string
  product: string
  quantity: number
  deliveryDate: string
  assignedDriverId: string | null
  status: OrderStatus
  failureReason?: string
}
