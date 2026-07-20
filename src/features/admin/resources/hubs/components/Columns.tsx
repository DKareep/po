import { createColumnHelper } from '@tanstack/react-table'

import { HubActions } from './HubActions'

import type { Hub } from '../types'

const columnHelper = createColumnHelper<Hub>()

interface HubColumnsProps {
  onEdit: (hub: Hub) => void
  onDelete: (hub: Hub) => void
}

export function getHubColumns({ onEdit, onDelete }: HubColumnsProps) {
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
        <HubActions hub={row.original} onEdit={onEdit} onDelete={onDelete} />
      ),
    }),
  ]
}
