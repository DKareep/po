import { Suspense, lazy } from 'react'

import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute, RoleRoute } from './guards'
import { roleRoutes } from './role.route.ts'

import Shell from '@/components/layout/Shell'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Spinner } from '@/components/ui'

const LoginPage = lazy(() => import('@/features/auth/login/LoginPage.tsx'))

const loading = (
  <ErrorBoundary>
    <Suspense fallback={<Spinner label="Loading..." />}>
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
    element: <ProtectedRoute />,

    children: roleRoutes.map((route) => ({
      element: <RoleRoute role={route.role} />,

      children: [
        {
          path: route.path,

          element: (
            <ErrorBoundary>
              <Suspense fallback={<Spinner label="Loading..." />}>
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
