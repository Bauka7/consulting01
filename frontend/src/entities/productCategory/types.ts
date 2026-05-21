export interface ProductCategoryDto {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  createdAt: string
}

export interface CreateProductCategoryDto {
  name: string
  description?: string
  iconUrl?: string
}

export interface UpdateProductCategoryDto {
  name?: string
  description?: string
  iconUrl?: string
}
