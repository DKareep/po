import type { Role } from '@/types'
import type { RouteObject } from 'react-router-dom'

import { adminRoutes } from './admin.routes'
import { driverRoutes } from './driver.routes'

export interface RoleRouteConfig {
  role: Role
  path: string
  variant: 'admin' | 'driver'
  children: RouteObject[]
}

export const roleRoutes: RoleRouteConfig[] = [
  {
    role: 'admin',
    path: '/admin',
    variant: 'admin',
    children: adminRoutes,
  },
  {
    role: 'driver',
    path: '/driver',
    variant: 'driver',
    children: driverRoutes,
  },
]
