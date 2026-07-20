import { useInfiniteQuery } from '@tanstack/react-query'

import { getVehicles } from '../api/getvehicles'
import { type VehicleFilters } from '../types'

export function useVehicles(filters: VehicleFilters) {
  return useInfiniteQuery({
    queryKey: ['vehicles', filters],

    initialPageParam: 1,

    queryFn: ({ pageParam }) =>
      getVehicles({
        ...filters,
        page: pageParam,
      }),

    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination

      return page < totalPages ? page + 1 : undefined
    },
  })
}
