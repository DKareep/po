import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthenticated, useUserRole } from '@/stores/auth'
import type { Role } from '@/types'

function roleHome(role: Role | null) {
  switch (role) {
    case 'admin':
      return '/admin'

    case 'driver':
      return '/driver'

    default:
      return '/login'
  }
}

export function ProtectedRoute() {
  const authenticated = useAuthenticated()
  const location = useLocation()

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

interface RoleRouteProps {
  role: Role
}

export function RoleRoute({ role }: RoleRouteProps) {
  const userRole = useUserRole()

  if (userRole !== role) {
    return <Navigate to={roleHome(userRole)} replace />
  }

  return <Outlet />
}
