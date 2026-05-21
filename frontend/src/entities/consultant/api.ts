import { api } from '@/shared/api/axios'
import type { ConsultantDto, CreateConsultantDto, UpdateConsultantDto } from './types'
import type { Page } from '@/entities/user/types'

export const consultantApi = {
  getAll: (params: { page?: number; size?: number }) =>
    api.get<Page<ConsultantDto>>('/consultants', { params }).then((r) => r.data),

  search: (name?: string) =>
    api.get<ConsultantDto[]>('/consultants/search', { params: { name } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ConsultantDto>(`/consultants/${id}`).then((r) => r.data),

  getByUserId: (userId: string) =>
    api.get<ConsultantDto>(`/consultants/by-user/${userId}`).then((r) => r.data),

  getByFactory: (factoryId: string, params?: { page?: number; size?: number }) =>
    api.get<Page<ConsultantDto>>(`/consultants/by-factory/${factoryId}`, { params }).then((r) => r.data),

  create: (data: CreateConsultantDto) =>
    api.post<ConsultantDto>('/consultants', data).then((r) => r.data),

  updateMy: (data: UpdateConsultantDto) =>
    api.put<ConsultantDto>('/consultants/my', data).then((r) => r.data),

  delete: (id: string) => api.delete(`/consultants/${id}`).then((r) => r.data),
}
