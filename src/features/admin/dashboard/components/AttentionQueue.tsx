import { AlertTriangle, UserPlus, XCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Order } from '../../operations/orders/types'
import type { LocationInventory } from '../../inventory/types'

interface AttentionQueueProps {
  unassignedOrders: Order[]
  failedOrders: Order[]
  criticalLocations: {
    location: LocationInventory
    product: string
    volume: number
  }[]
  onAssignDriver: (order: Order) => void
  onReplenish: (location: LocationInventory) => void
  destinationsMap: Record<string, string>
}

export function AttentionQueue({
  unassignedOrders,
  failedOrders,
  criticalLocations,
  onAssignDriver,
  onReplenish,
  destinationsMap,
}: AttentionQueueProps) {
  const totalAlerts =
    unassignedOrders.length + failedOrders.length + criticalLocations.length

  if (totalAlerts === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h3 className="text-base font-bold text-text mb-4">Attention Queue</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
          <p className="text-sm font-semibold text-text">All Caught Up!</p>
          <p className="text-xs text-text-muted mt-1">
            No pending items require operational attention at this time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-base font-bold text-text">Attention Queue</h3>
        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 animate-pulse">
          {totalAlerts} Action Required
        </span>
      </div>

      <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3">
        {criticalLocations.map(({ location, product, volume }) => {
          const prodName =
            product === 'jet_a1'
              ? 'Jet A-1'
              : product.charAt(0).toUpperCase() + product.slice(1)
          return (
            <div
              key={`stock-${location.id}-${product}`}
              className="flex items-start justify-between gap-4 rounded-lg border border-red-500/10 bg-red-500/5 p-4"
            >
              <div className="flex gap-3">
                <div className="mt-0.5 rounded bg-red-500/10 p-1.5 text-red-400 shrink-0 self-start">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">
                    Low Stock Alert
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    <strong>{location.name}</strong> is critically low on{' '}
                    <strong>{prodName}</strong>. Only{' '}
                    <strong>{volume.toLocaleString()} L</strong> remaining.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => onReplenish(location)}
              >
                Replenish
              </Button>
            </div>
          )
        })}

        {unassignedOrders.map((order) => {
          const destName =
            destinationsMap[order.destinationId] || order.destinationId
          const prodName =
            order.product === 'jet_a1'
              ? 'Jet A-1'
              : order.product.charAt(0).toUpperCase() + order.product.slice(1)
          return (
            <div
              key={`unassigned-${order.id}`}
              className="flex items-start justify-between gap-4 rounded-lg border border-blue-500/10 bg-blue-500/5 p-4"
            >
              <div className="flex gap-3">
                <div className="mt-0.5 rounded bg-blue-500/10 p-1.5 text-blue-400 shrink-0 self-start">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">
                    Unassigned Order
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Order <strong>{order.id}</strong> (
                    <strong>
                      {order.quantity.toLocaleString()} L of {prodName}
                    </strong>
                    ) for <strong>{destName}</strong> has no driver assigned.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => onAssignDriver(order)}
              >
                Assign Driver
              </Button>
            </div>
          )
        })}

        {failedOrders.map((order) => {
          const destName =
            destinationsMap[order.destinationId] || order.destinationId
          return (
            <div
              key={`failed-${order.id}`}
              className="flex items-start gap-3 rounded-lg border border-orange-500/10 bg-orange-500/5 p-4"
            >
              <div className="mt-0.5 rounded bg-orange-500/10 p-1.5 text-orange-400 shrink-0 self-start">
                <XCircle size={16} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text">Failed Delivery</h4>
                <p className="text-xs text-text-secondary mt-1">
                  Delivery for order <strong>{order.id}</strong> to{' '}
                  <strong>{destName}</strong> failed.
                </p>
                {order.failureReason && (
                  <p className="text-[11px] text-orange-400 italic mt-1 leading-normal bg-orange-500/5 p-1.5 rounded border border-orange-500/10">
                    Reason: {order.failureReason}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
