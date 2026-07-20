import { useInfiniteQuery } from '@tanstack/react-query'

import { getProducts } from '../api/getProducts'
import { type ProductFilters } from '../types'

export function useProducts(filters: ProductFilters) {
  return useInfiniteQuery({
    queryKey: ['products', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getProducts({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
