import { useQuery } from '@tanstack/react-query'
import { getLiveFleet } from '../api/getLiveFleet'
import { getHubsInventory } from '../api/getHubsInventory'

export function useLiveFleetQuery(refetchInterval: number | false = 30000) {
  const fleetQuery = useQuery({
    queryKey: ['liveFleet'],
    queryFn: getLiveFleet,
    refetchInterval,
  })

  const hubsQuery = useQuery({
    queryKey: ['hubsInventory'],
    queryFn: getHubsInventory,
    staleTime: 600000, // Static hub info changes rarely, keep 10 mins
  })

  return {
    fleetData: fleetQuery.data,
    hubsData: hubsQuery.data?.items,
    isLoading: fleetQuery.isLoading || hubsQuery.isLoading,
    error: fleetQuery.error || hubsQuery.error,
    refetch: async () => {
      await Promise.all([fleetQuery.refetch(), hubsQuery.refetch()])
    },
    isRefetching: fleetQuery.isRefetching || hubsQuery.isRefetching,
  }
}
