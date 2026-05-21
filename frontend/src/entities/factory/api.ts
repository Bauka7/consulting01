import { api } from '@/shared/api/axios'
import type { FactoryDto, CreateFactoryDto, UpdateFactoryDto } from './types'
import type { Page } from '@/entities/user/types'
import type { ConsultantDto } from '@/entities/consultant/types'
import type { RequestDto } from '@/entities/request/types'

export const factoryApi = {
  getAll: (params: { page?: number; size?: number; categoryId?: string }) =>
    api.get<Page<FactoryDto>>('/factories', { params }).then((r) => r.data),

  search: (name?: string) =>
    api.get<FactoryDto[]>('/factories/search', { params: { name } }).then((r) => r.data),

  getById: (id: string) =>
    api.get<FactoryDto>(`/factories/${id}`).then((r) => r.data),

  getConsultants: (id: string, params: { page?: number; size?: number }) =>
    api.get<Page<ConsultantDto>>(`/factories/${id}/consultants`, { params }).then((r) => r.data),

  create: (data: CreateFactoryDto) =>
    api.post<FactoryDto>('/factories', data).then((r) => r.data),

  update: (id: string, data: UpdateFactoryDto) =>
    api.put<FactoryDto>(`/factories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/factories/${id}`).then((r) => r.data),

  getMyFactory: () =>
    api.get<FactoryDto>('/factories/my').then((r) => r.data),

  getMyRequests: (params: { page?: number; size?: number }) =>
    api.get<Page<RequestDto>>('/factories/my/requests', { params }).then((r) => r.data),
}
