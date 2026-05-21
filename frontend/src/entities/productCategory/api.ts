import { api } from '@/shared/api/axios'
import type { ProductCategoryDto, CreateProductCategoryDto, UpdateProductCategoryDto } from './types'

export const categoryApi = {
  getAll: () =>
    api.get<ProductCategoryDto[]>('/categories').then((r) => r.data),

  getById: (id: string) =>
    api.get<ProductCategoryDto>(`/categories/${id}`).then((r) => r.data),

  create: (data: CreateProductCategoryDto) =>
    api.post<ProductCategoryDto>('/categories', data).then((r) => r.data),

  update: (id: string, data: UpdateProductCategoryDto) =>
    api.put<ProductCategoryDto>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/categories/${id}`).then((r) => r.data),
}
