import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Driver } from '../types'

interface DriverActionsProps {
  driver: Driver
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export function DriverActions({
  driver,
  onEdit,
  onDelete,
}: DriverActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit driver"
        onClick={() => onEdit(driver)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete driver"
        onClick={() => onDelete(driver)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
