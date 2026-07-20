import { createColumnHelper } from '@tanstack/react-table'

import { VehicleActions } from './VehicleActions'

import type { Vehicle } from '../types'

const columnHelper = createColumnHelper<Vehicle>()

interface VehicleColumnsProps {
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export function getVehicleColumns({ onEdit, onDelete }: VehicleColumnsProps) {
  return [
    columnHelper.accessor('registration', {
      id: 'registration',
      header: 'Registration',
      size: 200,
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor('capacity', {
      id: 'capacity',
      header: 'Capacity',
      size: 160,
      cell: (info) => `${info.getValue().toLocaleString()} L`,
    }),

    columnHelper.accessor('type', {
      id: 'type',
      header: 'Type',
      size: 180,
      cell: (info) => info.getValue(),
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 100,

      cell: ({ row }) => (
        <VehicleActions
          vehicle={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    }),
  ]
}
