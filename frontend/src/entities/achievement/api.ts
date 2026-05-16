import { api } from '@/shared/api/axios'
import type { AchievementDto, CreateAchievementDto } from './types'
import type { Page } from '@/entities/user/types'

export const achievementApi = {
  getMy: () => api.get<AchievementDto[]>('/achievements/my').then((r) => r.data),

  getByUser: (userId: string) =>
    api.get<AchievementDto[]>(`/achievements/user/${userId}`).then((r) => r.data),

  getAll: (params: { page?: number; size?: number }) =>
    api.get<Page<AchievementDto>>('/achievements', { params }).then((r) => r.data),

  create: (data: CreateAchievementDto) =>
    api.post<AchievementDto>('/achievements', data).then((r) => r.data),

  delete: (id: string) => api.delete(`/achievements/${id}`).then((r) => r.data),
}
