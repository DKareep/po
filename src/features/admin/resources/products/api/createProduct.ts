import { api } from '@/services/api'
import type { CreateProductInput } from '../schema/product.schema'

export async function createProduct(payload: CreateProductInput) {
  const { data } = await api.post('/products', payload)

  return data
}
