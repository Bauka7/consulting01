import { api } from '@/shared/api/axios'
import type { NotificationDto } from './types'
import type { Page } from '@/entities/user/types'

export const notificationApi = {
  getMy: (params: { page?: number; size?: number }) =>
    api.get<Page<NotificationDto>>('/notifications', { params }).then((r) => r.data),

  markRead: (id: string) =>
    api.put<NotificationDto>(`/notifications/${id}/read`).then((r) => r.data),

  delete: (id: string) => api.delete(`/notifications/${id}`).then((r) => r.data),

  deleteAll: () => api.delete('/notifications').then((r) => r.data),
}
