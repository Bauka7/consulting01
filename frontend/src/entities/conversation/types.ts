export type ConversationType = 'CLIENT_CONSULTANT' | 'CONSULTANT_FACTORY'

export interface MessageDto {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  read: boolean
  createdAt: string
}

export interface ConversationDto {
  id: string
  type: ConversationType
  requestId: string
  requestProduct: string
  initiatorId: string
  initiatorName: string
  participantId: string
  participantName: string
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
  createdAt: string
}

export interface CreateConversationDto {
  requestId: string
  type: ConversationType
}

export interface SendMessageDto {
  content: string
}

export interface PagedMessages {
  content: MessageDto[]
  totalPages: number
  totalElements: number
  number: number
}
