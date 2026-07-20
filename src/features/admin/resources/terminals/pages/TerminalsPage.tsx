import { useMemo, useState } from 'react'

import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { getTerminalColumns } from '../components/Columns'
import { DataTable } from '@/components/ui/data-table'
import { useTableFilters } from '@/hooks/useTableFilters'

import { TerminalFilters } from '../components/TerminalFilters'
import { useTerminals } from '../hooks/useTerminals'
import { Button } from '@/components/ui'
import { CreateTerminalModal } from '@/features/admin/resources/terminals/components/CreateTerminalModal.tsx'
import { EditTerminalModal } from '@/features/admin/resources/terminals/components/EditTerminalModal.tsx'
import { DeleteTerminalModal } from '@/features/admin/resources/terminals/components/DeleteTerminalModal.tsx'

import type { Terminal } from '../types'

export default function TerminalsPage() {
  const filters = useTableFilters()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [editTerminal, setEditTerminal] = useState<Terminal | null>(null)
  const [deleteTerminal, setDeleteTerminal] = useState<Terminal | null>(null)

  const columns = useMemo(
    () =>
      getTerminalColumns({
        onEdit: setEditTerminal,
        onDelete: setDeleteTerminal,
      }),
    [],
  )

  const query = useTerminals({
    pageSize: 10,
    search: filters.get('search'),
  })

  const terminals = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  )

  const table = useReactTable({
    data: terminals,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Terminals
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Manage terminal locations and their fuel inventory.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          Create Terminal
        </Button>
      </div>
      <TerminalFilters />

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

      <CreateTerminalModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditTerminalModal
        terminal={editTerminal}
        open={!!editTerminal}
        onClose={() => setEditTerminal(null)}
      />

      <DeleteTerminalModal
        terminal={deleteTerminal}
        open={!!deleteTerminal}
        onClose={() => setDeleteTerminal(null)}
      />
    </div>
  )
}
