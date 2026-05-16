import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/authStore'
import { api } from '@/shared/api/axios'
import type { UserDto } from '@/entities/user/types'

export function AuthInit() {
  const { setAccessToken, setUser, setInitialized, logout } = useAuthStore()

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      setInitialized(true)
      return
    }

    api
      .post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken })
      .then(async ({ data }) => {
        setAccessToken(data.accessToken)
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
        }
        const profile = await api.get<UserDto>('/users/profile', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        })
        setUser(profile.data)
      })
      .catch(() => {
        logout()
      })
      .finally(() => {
        setInitialized(true)
      })
  }, [setAccessToken, setUser, setInitialized, logout])

  return <Outlet />
}
