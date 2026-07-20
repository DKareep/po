import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Terminal } from '../types'

interface TerminalActionsProps {
  terminal: Terminal
  onEdit: (terminal: Terminal) => void
  onDelete: (terminal: Terminal) => void
}

export function TerminalActions({
  terminal,
  onEdit,
  onDelete,
}: TerminalActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit terminal"
        onClick={() => onEdit(terminal)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete terminal"
        onClick={() => onDelete(terminal)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
