import { api } from '@/shared/api/axios'
import type { UserDto, UserUpdateRequest, UserRole, Page } from './types'

export const userApi = {
  create: (data: { fullName: string; phone: string; password: string; role: UserRole }) =>
    api.post<UserDto>('/auth/register', data).then((r) => r.data),

  getProfile: () => api.get<UserDto>('/users/profile').then((r) => r.data),

  updateProfile: (data: UserUpdateRequest) =>
    api.put<UserDto>('/users/profile', data).then((r) => r.data),

  getById: (id: string) => api.get<UserDto>(`/users/${id}`).then((r) => r.data),

  getAll: (params: { page?: number; size?: number }) =>
    api.get<Page<UserDto>>('/users', { params }).then((r) => r.data),

  updateRole: (id: string, role: UserRole) =>
    api.put<UserDto>(`/users/${id}/role`, null, { params: { role } }).then((r) => r.data),

  delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
}
