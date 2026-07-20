import { createColumnHelper } from '@tanstack/react-table'

import { TerminalActions } from './TerminalActions'

import type { Terminal } from '../types'

const columnHelper = createColumnHelper<Terminal>()

interface TerminalColumnsProps {
  onEdit: (terminal: Terminal) => void
  onDelete: (terminal: Terminal) => void
}

export function getTerminalColumns({ onEdit, onDelete }: TerminalColumnsProps) {
  return [
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      size: 200,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('address', {
      id: 'address',
      header: 'Address',
      size: 250,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('coordinates', {
      id: 'coordinates',
      header: 'Coordinates',
      size: 180,
      cell: (info) => {
        const coords = info.getValue()
        if (!coords) return '-'
        return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 100,

      cell: ({ row }) => (
        <TerminalActions
          terminal={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}
