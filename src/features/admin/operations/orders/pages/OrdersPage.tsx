import { useMemo, useState } from 'react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'
import { Button } from '@/components/ui'

import { getOrderColumns } from '../components/Columns'
import { OrderFilters } from '../components/OrderFilters'
import { useOrders } from '../hooks/useOrders'
import { CreateOrderModal } from '../components/CreateOrderModal'
import { EditOrderModal } from '../components/EditOrderModal'
import { DeleteOrderModal } from '../components/DeleteOrderModal'
import { AssignDriverModal } from '../components/AssignDriverModal'

import { useHubs } from '@/features/admin/resources/hubs/hooks/useHubs'
import { useTerminals } from '@/features/admin/resources/terminals/hooks/useTerminals'
import { useDrivers } from '@/features/admin/resources/drivers/hooks/useDrivers'

import type { Order } from '../types'

export default function OrdersPage() {
  const filters = useTableFilters()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [deleteOrder, setDeleteOrder] = useState<Order | null>(null)
  const [assignOrder, setAssignOrder] = useState<Order | null>(null)

  // Fetch contextual details for display mappings & form selectors
  const hubsQuery = useHubs({ pageSize: 100 })
  const terminalsQuery = useTerminals({ pageSize: 100 })
  const driversQuery = useDrivers({ pageSize: 100 })

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

  // Lookup maps for table rendering
  const destinationsMap = useMemo(() => {
    const map: Record<string, { name: string; type: string }> = {}
    hubs.forEach((h) => {
      map[h.id] = { name: h.name, type: 'hub' }
    })
    terminals.forEach((t) => {
      map[t.id] = { name: t.name, type: 'terminal' }
    })
    return map
  }, [hubs, terminals])

  const driversMap = useMemo(() => {
    const map: Record<string, string> = {}
    drivers.forEach((d) => {
      map[d.id] = d.name
    })
    return map
  }, [drivers])

  const combinedDestinations = useMemo(() => {
    return [
      ...hubs.map((h) => ({
        id: h.id,
        name: h.name,
        type: 'hub' as const,
        coordinates: h.coordinates,
      })),
      ...terminals.map((t) => ({
        id: t.id,
        name: t.name,
        type: 'terminal' as const,
        coordinates: t.coordinates,
      })),
    ]
  }, [hubs, terminals])

  const columns = useMemo(
    () =>
      getOrderColumns({
        onEdit: setEditOrder,
        onDelete: setDeleteOrder,
        onAssignDriver: setAssignOrder,
        destinationsMap,
        driversMap,
      }),
    [destinationsMap, driversMap],
  )

  const query = useOrders({
    pageSize: 10,
    status: filters.get('status'),
  })

  const orders = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: orders,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const isLoadingContext =
    hubsQuery.isLoading || terminalsQuery.isLoading || driversQuery.isLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Orders
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            View, create, and manage customer delivery orders.
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          disabled={isLoadingContext}
        >
          Create Order
        </Button>
      </div>
      <OrderFilters />

      <DataTable
        table={table}
        isLoading={query.isLoading || isLoadingContext}
        isFetching={query.isFetching}
        infiniteScroll={{
          hasNextPage: query.hasNextPage,
          isFetchingNextPage: query.isFetchingNextPage,
          fetchNextPage: query.fetchNextPage,
        }}
      />

      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        destinations={combinedDestinations}
        drivers={drivers}
      />

      <EditOrderModal
        order={editOrder}
        open={!!editOrder}
        onClose={() => setEditOrder(null)}
        destinations={combinedDestinations}
        drivers={drivers}
      />

      <DeleteOrderModal
        order={deleteOrder}
        open={!!deleteOrder}
        onClose={() => setDeleteOrder(null)}
      />

      <AssignDriverModal
        key={assignOrder?.id}
        order={assignOrder}
        open={!!assignOrder}
        drivers={drivers}
        onClose={() => setAssignOrder(null)}
      />
    </div>
  )
}
