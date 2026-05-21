import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense, type ComponentType } from 'react'
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute'
import { AuthInit } from './AuthInit'

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function Lazy(factory: () => Promise<{ default: ComponentType }>) {
  const C = lazy(factory)
  return (
    <Suspense fallback={<Loading />}>
      <C />
    </Suspense>
  )
}
const L = Lazy

export const router = createBrowserRouter([
  {
    element: <AuthInit />,
    children: [
      { path: '/', element: L(() => import('@/pages/Landing')) },
      { path: '/login', element: L(() => import('@/pages/Login')) },
      { path: '/register', element: L(() => import('@/pages/Register')) },
      { path: '/consultants', element: L(() => import('@/pages/Consultants')) },
      { path: '/consultants/:id', element: L(() => import('@/pages/Consultants/Detail')) },
      { path: '/factories', element: L(() => import('@/pages/Factories')) },
      { path: '/factories/:id', element: L(() => import('@/pages/Factories/Detail')) },

      // Client routes
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Dashboard'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/requests',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Requests'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/requests/new',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/RequestNew'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/requests/:id',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/RequestDetail'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Messages'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/messages/:id',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Messages/Chat'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/notifications',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Notifications'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute roles={['CLIENT']}>
            {L(() => import('@/pages/client/Profile'))}
          </ProtectedRoute>
        ),
      },

      // Consultant routes
      {
        path: '/consultant/dashboard',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Dashboard'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/requests',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Requests'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/requests/:id',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/RequestDetail'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/messages',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Messages'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/messages/:id',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Messages/Chat'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/notifications',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/client/Notifications'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/profile',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Profile'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/links',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Links'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/consultant/achievements',
        element: (
          <ProtectedRoute roles={['CONSULTANT']}>
            {L(() => import('@/pages/consultant/Achievements'))}
          </ProtectedRoute>
        ),
      },

      // Admin routes
      {
        path: '/admin/dashboard',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Dashboard'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Users'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/users/:id',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/UserDetail'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/consultants',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Consultants'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/factories',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Factories'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/categories',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Categories'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/requests',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Requests'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/notifications',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/client/Notifications'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/achievements',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Achievements'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/audit',
        element: (
          <ProtectedRoute roles={['ADMIN']}>
            {L(() => import('@/pages/admin/Audit'))}
          </ProtectedRoute>
        ),
      },

      // Factory routes
      {
        path: '/factory/dashboard',
        element: (
          <ProtectedRoute roles={['FACTORY']}>
            {L(() => import('@/pages/factory/Dashboard'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/factory/requests',
        element: (
          <ProtectedRoute roles={['FACTORY']}>
            {L(() => import('@/pages/factory/Requests'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/factory/requests/:id',
        element: (
          <ProtectedRoute roles={['FACTORY']}>
            {L(() => import('@/pages/factory/RequestDetail'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/factory/messages',
        element: (
          <ProtectedRoute roles={['FACTORY']}>
            {L(() => import('@/pages/factory/Messages'))}
          </ProtectedRoute>
        ),
      },
      {
        path: '/factory/messages/:id',
        element: (
          <ProtectedRoute roles={['FACTORY']}>
            {L(() => import('@/pages/factory/Messages/Chat'))}
          </ProtectedRoute>
        ),
      },

      { path: '/403', element: L(() => import('@/pages/Forbidden')) },
      { path: '/404', element: L(() => import('@/pages/NotFound')) },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
])
