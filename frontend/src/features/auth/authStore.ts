import { create } from 'zustand'
import type { UserDto } from '@/entities/user/types'

interface AuthState {
  accessToken: string | null
  user: UserDto | null
  isInitialized: boolean
  setAccessToken: (token: string | null) => void
  setUser: (user: UserDto | null) => void
  setInitialized: (v: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user }),
  setInitialized: (v) => set({ isInitialized: v }),

  logout: () => {
    localStorage.removeItem('refreshToken')
    set({ accessToken: null, user: null })
  },
}))
