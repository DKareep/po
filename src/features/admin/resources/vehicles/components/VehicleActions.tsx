import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Vehicle } from '../types'

interface VehicleActionsProps {
  vehicle: Vehicle
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

export function VehicleActions({
  vehicle,
  onEdit,
  onDelete,
}: VehicleActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit vehicle"
        onClick={() => onEdit(vehicle)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete vehicle"
        onClick={() => onDelete(vehicle)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
