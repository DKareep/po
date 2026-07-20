import { useInfiniteQuery } from '@tanstack/react-query'

import { getDrivers } from '../api/getDrivers'
import { type DriverFilters } from '../types'

export function useDrivers(filters: DriverFilters) {
  return useInfiniteQuery({
    queryKey: ['drivers', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getDrivers({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
