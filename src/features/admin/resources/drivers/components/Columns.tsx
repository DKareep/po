import { createColumnHelper } from '@tanstack/react-table'

import { DriverActions } from './DriverActions'

import type { Driver } from '../types'

const columnHelper = createColumnHelper<Driver>()

interface DriverColumnsProps {
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export function getDriverColumns({ onEdit, onDelete }: DriverColumnsProps) {
  return [
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      size: 200,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('license', {
      id: 'license',
      header: 'License',
      size: 160,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('phone', {
      id: 'phone',
      header: 'Phone',
      size: 180,
      cell: (info) => info.getValue(),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 100,

      cell: ({ row }) => (
        <DriverActions
          driver={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}
