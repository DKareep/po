import { useInfiniteQuery } from '@tanstack/react-query'

import { getOrders } from '../api/getOrders'
import { type OrderFilters } from '../types'

export function useOrders(filters: OrderFilters) {
  return useInfiniteQuery({
    queryKey: ['orders', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getOrders({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
