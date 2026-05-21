export type RequestStatus = 'PENDING' | 'PROGRESS' | 'COMPLETED' | 'REJECTED'

export interface RequestDto {
  id: string
  clientId: string
  consultantId: string | null
  consultantName: string | null
  factoryId: string | null
  factoryName: string | null
  fullName: string
  phone: string
  product: string
  description: string | null
  status: RequestStatus
  comment: string | null
  quantity: number | null
  unit: string | null
  deadline: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  shippedAt: string | null
  factoryComment: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRequestDto {
  fullName: string
  phone: string
  product: string
  description?: string
  consultantId?: string
  factoryId?: string
  quantity?: number
  unit?: string
  deadline?: string
}

export interface UpdateRequestDto {
  fullName?: string
  phone?: string
  product?: string
  description?: string
  quantity?: number
  unit?: string
  deadline?: string
}

export interface UpdateTrackingDto {
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: string
}
