import { api } from '@/services/api'
import type { ProductFilters, ProductsResponse } from '../types'

interface GetProductsParams extends ProductFilters {
  page: number
}

export async function getProducts(
  params: GetProductsParams,
): Promise<ProductsResponse> {
  const { data } = await api.get<ProductsResponse>('/products', {
    params,
  })

  return data
}
