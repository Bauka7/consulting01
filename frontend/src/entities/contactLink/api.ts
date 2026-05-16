import { api } from '@/shared/api/axios'
import type { ContactLinkDto, CreateContactLinkDto, UpdateContactLinkDto } from './types'

export const contactLinkApi = {
  getByUser: (userId: string) =>
    api.get<ContactLinkDto[]>(`/contact-links/user/${userId}`).then((r) => r.data),

  create: (data: CreateContactLinkDto) =>
    api.post<ContactLinkDto>('/contact-links', data).then((r) => r.data),

  update: (id: string, data: UpdateContactLinkDto) =>
    api.put<ContactLinkDto>(`/contact-links/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/contact-links/${id}`).then((r) => r.data),
}
