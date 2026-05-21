export interface ConsultantDto {
  id: string
  userId: string
  fullName: string
  specialization: string
  experience: string
  factoryId: string | null
  factoryName: string | null
  createdAt: string
}

export interface CreateConsultantDto {
  userId: string
  specialization: string
  experience: string
  factoryId?: string
}

export interface UpdateConsultantDto {
  specialization?: string
  experience?: string
  factoryId?: string
  removeFactory?: boolean
}
