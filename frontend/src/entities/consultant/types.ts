export interface ConsultantDto {
  id: string
  userId: string
  fullName: string
  specialization: string
  experience: string
  createdAt: string
}

export interface CreateConsultantDto {
  userId: string
  specialization: string
  experience: string
}

export interface UpdateConsultantDto {
  specialization?: string
  experience?: string
}
