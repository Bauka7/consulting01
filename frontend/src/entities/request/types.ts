export type RequestStatus = 'PENDING' | 'PROGRESS' | 'COMPLETED' | 'REJECTED'

export interface RequestDto {
  id: string
  clientId: string
  consultantId: string | null
  fullName: string
  phone: string
  product: string
  description: string
  status: RequestStatus
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRequestDto {
  fullName: string
  phone: string
  product: string
  description: string
  consultantId?: string
}

export interface UpdateRequestDto {
  fullName?: string
  phone?: string
  product?: string
  description?: string
  consultantId?: string
  removeConsultant?: boolean
}
