import { SquarePen, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import type { Product } from '../types'

interface ProductActionsProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductActions({
  product,
  onEdit,
  onDelete,
}: ProductActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Edit product"
        onClick={() => onEdit(product)}
      >
        <SquarePen size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        aria-label="Delete product"
        onClick={() => onDelete(product)}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  )
}
