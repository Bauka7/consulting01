import { useAuthStore } from '@/features/auth/authStore'

export function useAuth() {
  const { user, accessToken, logout } = useAuthStore()
  return {
    user,
    accessToken,
    isAuthenticated: !!accessToken,
    isClient: user?.role === 'CLIENT',
    isConsultant: user?.role === 'CONSULTANT',
    isAdmin: user?.role === 'ADMIN',
    isFactory: user?.role === 'FACTORY',
    logout,
  }
}
