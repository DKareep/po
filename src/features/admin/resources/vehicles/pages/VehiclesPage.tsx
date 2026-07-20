import { useMemo, useState } from 'react'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getVehicleColumns } from '../components/Columns'
import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { VehicleFilters } from '../components/VehicleFilters'
import { useVehicles } from '../hooks/useVehicles'
import { Button } from '@/components/ui'
import { CreateVehicleModal } from '@/features/admin/resources/vehicles/components/CreateVehicleModal.tsx'

import type { Vehicle } from '../types'
import { EditVehicleModal } from '@/features/admin/resources/vehicles/components/EditVehicleModal.tsx'
import { DeleteVehicleModal } from '@/features/admin/resources/vehicles/components/DeleteVehicleModal.tsx'

export default function VehiclesPage() {
  const filters = useTableFilters()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)

  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null)

  const columns = useMemo(
    () =>
      getVehicleColumns({
        onEdit: setEditVehicle,
        onDelete: setDeleteVehicle,
      }),
    [],
  )
  const query = useVehicles({
    pageSize: 10,
    search: filters.get('search'),
    type: filters.get('type'),
    status: filters.get('status'),
  })

  const vehicles = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: vehicles,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Vehicles
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Manage fleet vehicles and their operational status.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>Create Vehicle</Button>
      </div>
      <VehicleFilters />

      <DataTable
        table={table}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        infiniteScroll={{
          hasNextPage: query.hasNextPage,
          isFetchingNextPage: query.isFetchingNextPage,
          fetchNextPage: query.fetchNextPage,
        }}
      />

      <CreateVehicleModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <EditVehicleModal
        vehicle={editVehicle}
        open={!!editVehicle}
        onClose={() => setEditVehicle(null)}
      />

      <DeleteVehicleModal
        vehicle={deleteVehicle}
        open={!!deleteVehicle}
        onClose={() => setDeleteVehicle(null)}
      />
    </div>
  )
}
