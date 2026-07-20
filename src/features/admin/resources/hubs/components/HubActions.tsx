import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Hub } from '../types'

interface HubActionsProps {
  hub: Hub
  onEdit: (hub: Hub) => void
  onDelete: (hub: Hub) => void
}

export function HubActions({ hub, onEdit, onDelete }: HubActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit hub"
        onClick={() => onEdit(hub)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete hub"
        onClick={() => onDelete(hub)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
