import { api } from '@/shared/api/axios'
import type { RequestDto, CreateRequestDto, UpdateRequestDto, RequestStatus } from './types'
import type { Page } from '@/entities/user/types'

export const requestApi = {
  create: (data: CreateRequestDto) =>
    api.post<RequestDto>('/requests', data).then((r) => r.data),

  getMy: (params: { status?: RequestStatus; page?: number; size?: number }) =>
    api.get<Page<RequestDto>>('/requests/my', { params }).then((r) => r.data),

  getConsultant: (params: { page?: number; size?: number }) =>
    api.get<Page<RequestDto>>('/requests/consultant', { params }).then((r) => r.data),

  getAll: (params: { status?: RequestStatus; page?: number; size?: number }) =>
    api.get<Page<RequestDto>>('/requests', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<RequestDto>(`/requests/${id}`).then((r) => r.data),

  update: (id: string, data: UpdateRequestDto) =>
    api.put<RequestDto>(`/requests/${id}`, data).then((r) => r.data),

  updateStatus: (id: string, status: RequestStatus, comment?: string) =>
    api
      .put<RequestDto>(`/requests/${id}/status`, null, { params: { status, comment } })
      .then((r) => r.data),

  delete: (id: string) => api.delete(`/requests/${id}`).then((r) => r.data),
}
