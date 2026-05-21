import type { ProductCategoryDto } from '@/entities/productCategory/types'

export interface FactoryDto {
  id: string
  name: string
  description: string | null
  location: string | null
  imageUrl: string | null
  categories: ProductCategoryDto[]
  createdAt: string
}

export interface CreateFactoryDto {
  name: string
  description?: string
  location?: string
  imageUrl?: string
  categoryIds?: string[]
}

export interface UpdateFactoryDto {
  name?: string
  description?: string
  location?: string
  imageUrl?: string
  categoryIds?: string[]
}
