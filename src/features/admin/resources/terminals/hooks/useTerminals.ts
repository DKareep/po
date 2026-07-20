import { useInfiniteQuery } from '@tanstack/react-query'

import { getTerminals } from '../api/getTerminals'
import { type TerminalFilters } from '../types'

export function useTerminals(filters: TerminalFilters) {
  return useInfiniteQuery({
    queryKey: ['terminals', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getTerminals({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
