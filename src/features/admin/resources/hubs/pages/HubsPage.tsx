import { useMemo, useState } from 'react'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getHubColumns } from '../components/Columns'
import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { HubFilters } from '../components/HubFilters'
import { useHubs } from '../hooks/useHubs'
import { Button } from '@/components/ui'
import { CreateHubModal } from '@/features/admin/resources/hubs/components/CreateHubModal.tsx'
import { EditHubModal } from '@/features/admin/resources/hubs/components/EditHubModal.tsx'
import { DeleteHubModal } from '@/features/admin/resources/hubs/components/DeleteHubModal.tsx'

import type { Hub } from '../types'

export default function HubsPage() {
  const filters = useTableFilters()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [editHub, setEditHub] = useState<Hub | null>(null)
  const [deleteHub, setDeleteHub] = useState<Hub | null>(null)

  const columns = useMemo(
    () =>
      getHubColumns({
        onEdit: setEditHub,
        onDelete: setDeleteHub,
      }),
    [],
  )

  const query = useHubs({
    pageSize: 10,
    search: filters.get('search'),
  })

  const hubs = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: hubs,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Hubs
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Manage hub locations and their fuel inventory.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>Create Hub</Button>
      </div>
      <HubFilters />

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

      <CreateHubModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditHubModal
        hub={editHub}
        open={!!editHub}
        onClose={() => setEditHub(null)}
      />

      <DeleteHubModal
        hub={deleteHub}
        open={!!deleteHub}
        onClose={() => setDeleteHub(null)}
      />
    </div>
  )
}
