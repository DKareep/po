import { createColumnHelper } from '@tanstack/react-table'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { LocationInventory } from '../types'

const columnHelper = createColumnHelper<LocationInventory>()

interface InventoryTableProps {
  onAdjustStock: (location: LocationInventory) => void
}

export function getStockStatus(volume: number, type: 'hub' | 'terminal') {
  const critThreshold = type === 'hub' ? 10000 : 5000
  const warnThreshold = type === 'hub' ? 30000 : 15000
  const capacity = type === 'hub' ? 200000 : 50000

  const fillPercentage = Math.min((volume / capacity) * 100, 100)

  if (volume < critThreshold) {
    return {
      label: 'Critical',
      textColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
      barColor: 'bg-red-500',
      barBg: 'bg-red-500/20',
      percentage: fillPercentage,
      status: 'critical' as const,
    }
  }

  if (volume < warnThreshold) {
    return {
      label: 'Low Warning',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      barColor: 'bg-orange-500',
      barBg: 'bg-orange-500/20',
      percentage: fillPercentage,
      status: 'warning' as const,
    }
  }

  return {
    label: 'Healthy',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    barColor: 'bg-emerald-500',
    barBg: 'bg-emerald-500/20',
    percentage: fillPercentage,
    status: 'healthy' as const,
  }
}

export function getInventoryColumns({ onAdjustStock }: InventoryTableProps) {
  const renderStockCell = (volume: number, type: 'hub' | 'terminal') => {
    const status = getStockStatus(volume, type)
    return (
      <div className="flex w-full flex-col py-1">
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className="text-text font-mono">
            {volume.toLocaleString()} L
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${status.bgColor} ${status.textColor}`}
          >
            {status.label}
          </span>
        </div>
        <div className={`h-1.5 w-full rounded-full ${status.barBg}`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
            style={{ width: `${status.percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return [
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Location',
      size: 250,
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex flex-col py-1">
            <span className="font-semibold text-text text-sm leading-tight">
              {item.name}
            </span>
            <span className="text-xs text-text-muted mt-0.5">
              {item.address}
            </span>
            <span className="self-start text-[10px] font-semibold text-primary uppercase tracking-wider mt-1 bg-primary/10 px-2 py-0.5 rounded-full">
              {item.type}
            </span>
          </div>
        )
      },
    }),

    columnHelper.accessor('inventory.diesel', {
      id: 'diesel',
      header: 'Diesel Stock',
      size: 200,
      cell: ({ row }) => {
        const item = row.original
        return renderStockCell(item.inventory.diesel, item.type)
      },
    }),

    columnHelper.accessor('inventory.petrol', {
      id: 'petrol',
      header: 'Petrol Stock',
      size: 200,
      cell: ({ row }) => {
        const item = row.original
        return renderStockCell(item.inventory.petrol, item.type)
      },
    }),

    columnHelper.accessor('inventory.jet_a1', {
      id: 'jet_a1',
      header: 'Jet A-1 Stock',
      size: 200,
      cell: ({ row }) => {
        const item = row.original
        return renderStockCell(item.inventory.jet_a1, item.type)
      },
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      size: 100,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          title="Adjust stock levels"
          aria-label="Adjust stock"
          onClick={() => onAdjustStock(row.original)}
        >
          <SlidersHorizontal size={18} />
        </Button>
      ),
    }),
  ]
}
