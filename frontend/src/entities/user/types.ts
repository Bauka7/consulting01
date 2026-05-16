export type UserRole = 'CLIENT' | 'CONSULTANT' | 'ADMIN'

export interface UserDto {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: UserRole
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UserUpdateRequest {
  fullName?: string
  phone?: string
  email?: string
  avatarUrl?: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
