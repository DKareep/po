export interface Vehicle {
  id: string
  registration: string
  capacity: number
  type: string
}

interface VehicleAllocation {
  id: string
  vehicleId: string
  date: string
}

export interface Shift {
  id: string
  status: 'active' | 'ended'
  startedAt: string
  endedAt: string | null
}

interface OrderDestination {
  name: string
  type: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
}

export type OrderStatus = 'pending' | 'assigned' | 'completed' | 'failed'

export interface DriverOrder {
  id: string
  destinationId: string
  product: string
  quantity: number
  deliveryDate: string
  assignedDriverId: string | null
  status: OrderStatus
  failureReason: string | null
  destinationDetails: OrderDestination | null
}

export interface TodaysShiftResponse {
  date: string
  hasAllocation: boolean
  vehicleAllocation: VehicleAllocation | null
  vehicle: Vehicle | null
  shift: Shift | null
  gps?: {
    lat: number
    lng: number
    updatedAt: string | null
  } | null
  orders: DriverOrder[]
}
