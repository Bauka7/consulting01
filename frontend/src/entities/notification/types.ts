export interface NotificationDto {
  id: string
  userId: string
  requestId: string | null
  message: string
  isRead: boolean
  createdAt: string
}
