import { Navigate, Outlet, useLocation } from 'react-router-dom'

import type { Role } from '@/types'

// const auhtTest = {
//   isAuthed: true,
//   role: 'admin',
// }
const auhtTest = {
  isAuthed: true,
  role: 'admin',
}
function roleHome(role: string) {
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
  const { isAuthed } = auhtTest
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

interface RoleRouteProps {
  role: Role
}

export function RoleRoute({ role }: RoleRouteProps) {
  const { role: userRole } = auhtTest

  if (userRole !== role) {
    return <Navigate to={roleHome(userRole)} replace />
  }

  return <Outlet />
}
