import { api } from '@/services/api'
import type { CreateProductInput } from '../schema/product.schema'

export interface UpdateProductPayload extends CreateProductInput {
  id: string
}

export async function updateProduct({ id, ...payload }: UpdateProductPayload) {
  const { data } = await api.put(`/products/${id}`, payload)

  return data
}
