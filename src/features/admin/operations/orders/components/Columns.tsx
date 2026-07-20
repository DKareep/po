import { createColumnHelper } from '@tanstack/react-table'

import { OrderActions } from './OrderActions'
import type { Order } from '../types'

const columnHelper = createColumnHelper<Order>()

interface OrderColumnsProps {
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
  onAssignDriver: (order: Order) => void
  destinationsMap: Record<string, { name: string; type: string }>
  driversMap: Record<string, string>
}

export function getOrderColumns({
  onEdit,
  onDelete,
  onAssignDriver,
  destinationsMap,
  driversMap,
}: OrderColumnsProps) {
  return [
    columnHelper.accessor('destinationId', {
      id: 'destination',
      header: 'Destination & ID',
      cell: ({ row }) => {
        const order = row.original
        const dest = destinationsMap[order.destinationId]
        const destName = dest ? dest.name : order.destinationId
        const destType = dest ? dest.type : ''
        return (
          <div className="flex flex-col py-1">
            <span className="text-[10px] font-semibold text-text-muted  tracking-wider uppercase mb-0.5">
              {order.id}
            </span>
            <span className="font-medium text-text text-sm leading-tight">
              {destName}
            </span>
            {destType && (
              <span className="text-[11px] text-text-muted capitalize mt-0.5">
                {destType}
              </span>
            )}
          </div>
        )
      },
    }),

    columnHelper.accessor('product', {
      id: 'details',
      header: 'Details',
      cell: ({ row }) => {
        const order = row.original
        const productName =
          order.product === 'jet_a1'
            ? 'Jet A-1'
            : order.product.charAt(0).toUpperCase() + order.product.slice(1)
        return (
          <div className="flex flex-col py-1">
            <span className="font-semibold text-text text-sm">
              {order.quantity.toLocaleString()} L
            </span>
            <span className="text-xs text-text-muted mt-0.5">
              {productName}
            </span>
          </div>
        )
      },
    }),

    columnHelper.accessor('deliveryDate', {
      id: 'deliveryDate',
      header: 'Date',
      cell: (info) => (
        <span className="text-sm font-medium text-text-secondary">
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.accessor('assignedDriverId', {
      id: 'driver',
      header: 'Driver',
      cell: (info) => {
        const driverId = info.getValue()
        if (!driverId) {
          return (
            <span className="text-xs text-text-muted italic">Unassigned</span>
          )
        }
        return (
          <span className="text-sm font-medium text-text-secondary">
            {driversMap[driverId] || driverId}
          </span>
        )
      },
    }),

    columnHelper.accessor('status', {
      id: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue()
        let badgeColor = 'bg-bg-secondary text-text-secondary border-border'
        if (status === 'assigned') {
          badgeColor = 'bg-info-soft text-info border-info-border'
        }
        if (status === 'completed') {
          badgeColor = 'bg-success-soft text-success border-success-border'
        }
        if (status === 'failed') {
          badgeColor = 'bg-danger-soft text-danger border-danger-border'
        }
        if (status === 'pending') {
          badgeColor = 'bg-warning-soft text-warning border-warning-border'
        }

        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${badgeColor}`}
          >
            {status}
          </span>
        )
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <OrderActions
          order={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignDriver={onAssignDriver}
        />
      ),
    }),
  ]
}
