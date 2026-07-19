import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const ShiftPage = lazy(
  () => import('@/features/driver/todays-shift/TodaysShiftPage'),
)

const Deliveries = lazy(
  () => import('@/features/driver/deliveries/DeliveriesPage'),
)
const DriveryMapPage = lazy(() => import('@/features/driver/map/MapPage'))

const ShiftHistoryPage = lazy(
  () => import('@/features/driver/history/HistoryPage'),
)

export const driverRoutes: RouteObject[] = [
  {
    index: true,
    element: <ShiftPage />,
  },
  {
    path: 'deliveries',
    element: <Deliveries />,
  },
  {
    path: 'map',
    element: <DriveryMapPage />,
  },
  {
    path: 'history',
    element: <ShiftHistoryPage />,
  },
]
