import { api } from '@/shared/api/axios'
import type {
  ConversationDto,
  MessageDto,
  CreateConversationDto,
  SendMessageDto,
  PagedMessages,
} from './types'

export const conversationApi = {
  list: () =>
    api.get<ConversationDto[]>('/conversations').then((r) => r.data),

  getById: (id: string) =>
    api.get<ConversationDto>(`/conversations/${id}`).then((r) => r.data),

  create: (data: CreateConversationDto) =>
    api.post<ConversationDto>('/conversations', data).then((r) => r.data),

  getMessages: (id: string, page = 0, size = 50) =>
    api
      .get<PagedMessages>(`/conversations/${id}/messages`, { params: { page, size } })
      .then((r) => r.data),

  sendMessage: (id: string, data: SendMessageDto) =>
    api.post<MessageDto>(`/conversations/${id}/messages`, data).then((r) => r.data),

  markRead: (id: string) =>
    api.post(`/conversations/${id}/read`).then((r) => r.data),

  getUnreadCount: () =>
    api.get<number>('/conversations/unread-count').then((r) => r.data),
}
