import { useMemo, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { useHubs } from '@/features/admin/resources/hubs/hooks/useHubs'
import { useTerminals } from '@/features/admin/resources/terminals/hooks/useTerminals'

import { InventorySummary } from '../components/InventorySummary'
import { InventoryFilters } from '../components/InventoryFilters'
import {
  getInventoryColumns,
  getStockStatus,
} from '../components/InventoryTable'
import { AdjustInventoryModal } from '../components/AdjustInventoryModal'
import type { LocationInventory } from '../types'

function getLocationStockStatus(location: LocationInventory) {
  const dieselStatus = getStockStatus(
    location.inventory.diesel,
    location.type,
  ).status
  const petrolStatus = getStockStatus(
    location.inventory.petrol,
    location.type,
  ).status
  const jetStatus = getStockStatus(
    location.inventory.jet_a1,
    location.type,
  ).status

  if (
    dieselStatus === 'critical' ||
    petrolStatus === 'critical' ||
    jetStatus === 'critical'
  ) {
    return 'critical'
  }
  if (
    dieselStatus === 'warning' ||
    petrolStatus === 'warning' ||
    jetStatus === 'warning'
  ) {
    return 'warning'
  }
  return 'healthy'
}

export default function InventoryPage() {
  const filters = useTableFilters()
  const [adjustingLocation, setAdjustingLocation] =
    useState<LocationInventory | null>(null)

  const hubsQuery = useHubs({ pageSize: 100 })
  const terminalsQuery = useTerminals({ pageSize: 100 })

  const hubs = useMemo(
    () => hubsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [hubsQuery.data],
  )
  const terminals = useMemo(
    () => terminalsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [terminalsQuery.data],
  )

  const locations = useMemo(() => {
    return [
      ...hubs.map((h) => ({
        id: h.id,
        name: h.name,
        type: 'hub' as const,
        address: h.address,
        inventory: {
          diesel: h.inventory?.diesel || 0,
          petrol: h.inventory?.petrol || 0,
          jet_a1: h.inventory?.jet_a1 || 0,
        },
        coordinates: h.coordinates,
      })),
      ...terminals.map((t) => ({
        id: t.id,
        name: t.name,
        type: 'terminal' as const,
        address: t.address,
        inventory: {
          diesel: t.inventory?.diesel || 0,
          petrol: t.inventory?.petrol || 0,
          jet_a1: t.inventory?.jet_a1 || 0,
        },
        coordinates: t.coordinates,
      })),
    ]
  }, [hubs, terminals])

  const aggregates = useMemo(() => {
    let totalDiesel = 0
    let totalPetrol = 0
    let totalJetA1 = 0
    let criticalCount = 0
    let warningCount = 0

    locations.forEach((loc) => {
      totalDiesel += loc.inventory.diesel
      totalPetrol += loc.inventory.petrol
      totalJetA1 += loc.inventory.jet_a1

      const locStatus = getLocationStockStatus(loc)
      if (locStatus === 'critical') criticalCount++
      if (locStatus === 'warning') warningCount++
    })

    return {
      totalDiesel,
      totalPetrol,
      totalJetA1,
      criticalCount,
      warningCount,
    }
  }, [locations])

  const searchParam = filters.get('search')?.toLowerCase() || ''
  const typeParam = filters.get('type') || ''
  const stockStatusParam = filters.get('stockStatus') || ''

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (
        searchParam &&
        !loc.name.toLowerCase().includes(searchParam) &&
        !loc.address.toLowerCase().includes(searchParam)
      ) {
        return false
      }

      if (typeParam && loc.type !== typeParam) {
        return false
      }

      if (stockStatusParam) {
        const locStatus = getLocationStockStatus(loc)
        if (locStatus !== stockStatusParam) {
          return false
        }
      }

      return true
    })
  }, [locations, searchParam, typeParam, stockStatusParam])

  const columns = useMemo(
    () => getInventoryColumns({ onAdjustStock: setAdjustingLocation }),
    [],
  )

  const table = useReactTable({
    data: filteredLocations,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const isLoading = hubsQuery.isLoading || terminalsQuery.isLoading
  const isFetching = hubsQuery.isFetching || terminalsQuery.isFetching

  return (
    <div className="space-y-6">
      <InventorySummary aggregates={aggregates} />
      <InventoryFilters />

      <DataTable table={table} isLoading={isLoading} isFetching={isFetching} />

      <AdjustInventoryModal
        location={adjustingLocation}
        open={!!adjustingLocation}
        onClose={() => setAdjustingLocation(null)}
      />
    </div>
  )
}
