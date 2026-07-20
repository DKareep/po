import { useMemo, useState } from 'react'

import { useHubs } from '@/features/admin/resources/hubs/hooks/useHubs'
import { useTerminals } from '@/features/admin/resources/terminals/hooks/useTerminals'
import { useDrivers } from '@/features/admin/resources/drivers/hooks/useDrivers'
import { useVehicles } from '@/features/admin/resources/vehicles/hooks/useVehicles'
import { useOrders } from '@/features/admin/operations/orders/hooks/useOrders'

import { DashboardStats } from '../components/DashboardStats'
import { AttentionQueue } from '../components/AttentionQueue'
import { RecentOrdersTable } from '../components/RecentOrdersTable'

import { AssignDriverModal } from '@/features/admin/operations/orders/components/AssignDriverModal'
import { AdjustInventoryModal } from '@/features/admin/inventory/components/AdjustInventoryModal'
import type { Hub } from '@/features/admin/resources/hubs/types'
import type { Order } from '../../operations/orders/types'
import type { LocationInventory } from '../../inventory/types'

export default function DashboardPage() {
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const [replenishingLocation, setReplenishingLocation] =
    useState<LocationInventory | null>(null)

  // Fetch all necessary telemetry metrics for dashboard compilation
  const hubsQuery = useHubs({ pageSize: 100 })
  const terminalsQuery = useTerminals({ pageSize: 100 })
  const driversQuery = useDrivers({ pageSize: 100 })
  const vehiclesQuery = useVehicles({ pageSize: 100 })
  const ordersQuery = useOrders({ pageSize: 100 })

  const hubs = useMemo(
    () => hubsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [hubsQuery.data],
  )
  const terminals = useMemo(
    () => terminalsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [terminalsQuery.data],
  )
  const drivers = useMemo(
    () => driversQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [driversQuery.data],
  )
  const vehicles = useMemo(
    () => vehiclesQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [vehiclesQuery.data],
  )
  const orders = useMemo(
    () => ordersQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [ordersQuery.data],
  )

  const destinationsMap = useMemo(() => {
    const map: Record<string, string> = {}
    hubs.forEach((h) => {
      map[h.id] = h.name
    })
    terminals.forEach((t) => {
      map[t.id] = t.name
    })
    return map
  }, [hubs, terminals])

  // Extract locations with critical stock alerts
  const criticalLocations = useMemo(() => {
    const alerts: {
      location: LocationInventory
      product: string
      volume: number
    }[] = []

    const checkLocation = (
      loc: Hub,
      type: 'hub' | 'terminal',
    ): LocationInventory => {
      const inventory = loc.inventory || {}
      const diesel = inventory.diesel || 0
      const petrol = inventory.petrol || 0
      const jet_a1 = inventory.jet_a1 || 0

      const locInv: LocationInventory = {
        id: loc.id,
        name: loc.name,
        type,
        address: loc.address,
        inventory: { diesel, petrol, jet_a1 },
        coordinates: loc.coordinates,
      }

      const critThreshold = type === 'hub' ? 10000 : 5000

      if (inventory.diesel < critThreshold) {
        alerts.push({
          location: locInv,
          product: 'diesel',
          volume: inventory.diesel,
        })
      }
      if (inventory.petrol < critThreshold) {
        alerts.push({
          location: locInv,
          product: 'petrol',
          volume: inventory.petrol,
        })
      }
      if (inventory.jet_a1 < critThreshold) {
        alerts.push({
          location: locInv,
          product: 'jet_a1',
          volume: inventory.jet_a1,
        })
      }

      return locInv
    }

    hubs.forEach((h) => checkLocation(h, 'hub'))
    terminals.forEach((t) => checkLocation(t, 'terminal'))

    return alerts
  }, [hubs, terminals])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === 'pending').length
    const completedOrders = orders.filter(
      (o) => o.status === 'completed',
    ).length
    const failedOrders = orders.filter((o) => o.status === 'failed').length

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      failedOrders,
      activeDrivers: drivers.length,
      activeVehicles: vehicles.length,
      criticalStockCount: new Set(criticalLocations.map((c) => c.location.id))
        .size,
    }
  }, [orders, drivers, vehicles, criticalLocations])

  const unassignedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'pending' || !o.assignedDriverId)
  }, [orders])

  const failedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'failed')
  }, [orders])

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5)
  }, [orders])

  const isLoading =
    hubsQuery.isLoading ||
    terminalsQuery.isLoading ||
    driversQuery.isLoading ||
    vehiclesQuery.isLoading ||
    ordersQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-sm font-medium text-text-secondary animate-pulse">
          Aggregating system status...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AttentionQueue
          unassignedOrders={unassignedOrders}
          failedOrders={failedOrders}
          criticalLocations={criticalLocations}
          destinationsMap={destinationsMap}
          onAssignDriver={setAssigningOrder}
          onReplenish={setReplenishingLocation}
        />

        <RecentOrdersTable
          orders={recentOrders}
          destinationsMap={destinationsMap}
        />
      </div>

      <AssignDriverModal
        key={assigningOrder?.id}
        order={assigningOrder}
        open={!!assigningOrder}
        drivers={drivers}
        onClose={() => setAssigningOrder(null)}
      />

      <AdjustInventoryModal
        location={replenishingLocation}
        open={!!replenishingLocation}
        onClose={() => setReplenishingLocation(null)}
      />
    </div>
  )
}
