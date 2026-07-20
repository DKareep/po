import { Suspense, lazy } from 'react'

import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute, RoleRoute } from './guards'
import { roleRoutes } from './role.route.ts'

import Shell from '@/components/layout/Shell'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Spinner } from '@/components/ui'

import AdminLogin from '@/features/auth/login/pages/AdminLogin.tsx'
import DriverLogin from '@/features/auth/login/pages/DriverLogin.tsx'

const LoginPage = lazy(
  () => import('@/features/auth/login/pages/LoginType.tsx'),
)

const loading = (
  <ErrorBoundary>
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center">
          <Spinner label="Loading..." />
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  </ErrorBoundary>
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: loading,
  },
  {
    path: '/login/admin',
    element: <AdminLogin />,
  },

  {
    path: '/login/driver',
    element: <DriverLogin />,
  },

  {
    element: <ProtectedRoute />,

    children: roleRoutes.map((route) => ({
      element: <RoleRoute role={route.role} />,

      children: [
        {
          path: route.path,

          element: (
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="flex h-screen w-screen items-center justify-center">
                    <Spinner label="Loading..." />
                  </div>
                }
              >
                <Shell variant={route.variant} />
              </Suspense>
            </ErrorBoundary>
          ),

          children: route.children,
        },
      ],
    })),
  },

  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
