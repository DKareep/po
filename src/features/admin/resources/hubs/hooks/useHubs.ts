import { useInfiniteQuery } from '@tanstack/react-query'

import { getHubs } from '../api/getHubs'
import { type HubFilters } from '../types'

export function useHubs(filters: HubFilters) {
  return useInfiniteQuery({
    queryKey: ['hubs', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getHubs({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
