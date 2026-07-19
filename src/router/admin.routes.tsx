import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// dashboard

const DashboardPage = lazy(
  () => import('@/features/admin/dashboard/DashboardPage'),
)

// inventory

const InventoryPage = lazy(
  () => import('@/features/admin/inventory/InventoryPage'),
)

// operations
const LiveFleetPage = lazy(
  () => import('@/features/admin/operations/live-fleet/LiveFleetPage'),
)
const OrdersPage = lazy(
  () => import('@/features/admin/operations/orders/OrdersPage'),
)
const VehicleAllocationPage = lazy(
  () =>
    import('@/features/admin/operations/vehicle-allocation/VehicleAllocationPage'),
)

// resources

const DriversPage = lazy(
  () => import('@/features/admin/resources/drivers/DriversPage'),
)
const HubsPage = lazy(() => import('@/features/admin/resources/hubs/HubsPage'))
const ProductPage = lazy(
  () => import('@/features/admin/resources/products/ProductPage'),
)
const TerminalsPage = lazy(
  () => import('@/features/admin/resources/terminals/TerminalsPage'),
)
const VehiclesPage = lazy(
  () => import('@/features/admin/resources/vehicles/VehiclesPage'),
)

export const adminRoutes: RouteObject[] = [
  {
    index: true,
    element: <DashboardPage />,
  },
  {
    path: 'orders',
    element: <OrdersPage />,
  },
  {
    path: 'allocation',
    element: <VehicleAllocationPage />,
  },
  {
    path: 'fleet',
    element: <LiveFleetPage />,
  },
  {
    path: 'inventory',
    element: <InventoryPage />,
  },
  {
    path: 'hubs',
    element: <HubsPage />,
  },
  {
    path: 'terminals',
    element: <TerminalsPage />,
  },
  {
    path: 'products',
    element: <ProductPage />,
  },
  {
    path: 'drivers',
    element: <DriversPage />,
  },
  {
    path: 'vehicles',
    element: <VehiclesPage />,
  },
]
