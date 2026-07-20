import { useMemo, useState } from 'react'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getDriverColumns } from '../components/Columns'
import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { DriverFilters } from '../components/DriverFilters'
import { useDrivers } from '../hooks/useDrivers'
import { Button } from '@/components/ui'
import { CreateDriverModal } from '@/features/admin/resources/drivers/components/CreateDriverModal.tsx'
import { EditDriverModal } from '@/features/admin/resources/drivers/components/EditDriverModal.tsx'
import { DeleteDriverModal } from '@/features/admin/resources/drivers/components/DeleteDriverModal.tsx'

import type { Driver } from '../types'

export default function DriversPage() {
  const filters = useTableFilters()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [editDriver, setEditDriver] = useState<Driver | null>(null)
  const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null)

  const columns = useMemo(
    () =>
      getDriverColumns({
        onEdit: setEditDriver,
        onDelete: setDeleteDriver,
      }),
    [],
  )

  const query = useDrivers({
    pageSize: 10,
    search: filters.get('search'),
  })

  const drivers = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: drivers,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreateModalOpen(true)}>Create Driver</Button>
      </div>
      <DriverFilters />

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

      <CreateDriverModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditDriverModal
        driver={editDriver}
        open={!!editDriver}
        onClose={() => setEditDriver(null)}
      />

      <DeleteDriverModal
        driver={deleteDriver}
        open={!!deleteDriver}
        onClose={() => setDeleteDriver(null)}
      />
    </div>
  )
}
