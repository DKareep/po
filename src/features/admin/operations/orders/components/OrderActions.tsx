import { SquarePen, Trash2, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Order } from '../types'

interface OrderActionsProps {
  order: Order
  onEdit: (order: Order) => void
  onDelete: (order: Order) => void
  onAssignDriver: (order: Order) => void
}

export function OrderActions({
  order,
  onEdit,
  onDelete,
  onAssignDriver,
}: OrderActionsProps) {
  const canAssign = order.status === 'pending' || order.status === 'assigned'

  return (
    <div className="flex items-center gap-2">
      {canAssign && (
        <Button
          variant="ghost"
          size="sm"
          aria-label="Assign driver"
          title="Assign Driver"
          onClick={() => onAssignDriver(order)}
        >
          <UserPlus size={18} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit order"
        title="Edit Order"
        onClick={() => onEdit(order)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete order"
        title="Delete Order"
        onClick={() => onDelete(order)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
