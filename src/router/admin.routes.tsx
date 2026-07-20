import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

// dashboard

const DashboardPage = lazy(
  () => import('@/features/admin/dashboard/pages/DashboardPage.tsx'),
)

// inventory

const InventoryPage = lazy(
  () => import('@/features/admin/inventory/pages/InventoryPage.tsx'),
)

// operations
const LiveFleetPage = lazy(
  () =>
    import('@/features/admin/operations/live-fleet/pages/LiveFleetPage.tsx'),
)
const OrdersPage = lazy(
  () => import('@/features/admin/operations/orders/pages/OrdersPage.tsx'),
)
const VehicleAllocationPage = lazy(
  () =>
    import('@/features/admin/operations/vehicle-allocation/pages/VehicleAllocationPage.tsx'),
)

// resources

const DriversPage = lazy(
  () => import('@/features/admin/resources/drivers/pages/DriversPage.tsx'),
)
const HubsPage = lazy(
  () => import('@/features/admin/resources/hubs/pages/HubsPage.tsx'),
)
const ProductPage = lazy(
  () => import('@/features/admin/resources/products/pages/ProductPage.tsx'),
)
const TerminalsPage = lazy(
  () => import('@/features/admin/resources/terminals/pages/TerminalsPage.tsx'),
)
const VehiclesPage = lazy(
  () => import('@/features/admin/resources/vehicles/pages/VehiclesPage.tsx'),
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
