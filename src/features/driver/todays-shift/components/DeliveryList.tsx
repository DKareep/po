import type { DriverOrder, OrderStatus } from '../types/shift.types'
import { MapPin, CheckCircle2, XCircle, Clock, Compass } from 'lucide-react'

interface DeliveryListProps {
  orders: DriverOrder[]
}

export function DeliveryList({ orders }: DeliveryListProps) {
  // Format product name for display
  const formatProduct = (product: string) => {
    switch (product.toLowerCase()) {
      case 'diesel':
        return 'Diesel'
      case 'petrol':
        return 'Petrol'
      case 'jet_a1':
        return 'Jet A-1'
      default:
        return product
    }
  }

  // Get status details (label, color classes, icon)
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          classes: 'bg-success-soft text-success border-success-border',
          icon: <CheckCircle2 size={14} className="shrink-0" />,
        }
      case 'failed':
        return {
          label: 'Failed',
          classes: 'bg-danger-soft text-danger border-danger-border',
          icon: <XCircle size={14} className="shrink-0" />,
        }
      case 'assigned':
        return {
          label: 'Assigned',
          classes: 'bg-info-soft text-info border-info-border',
          icon: (
            <Compass
              size={14}
              className="shrink-0 text-info animate-spin-slow"
            />
          ),
        }
      case 'pending':
      default:
        return {
          label: 'Pending',
          classes: 'bg-warning-soft text-warning border-warning-border',
          icon: <Clock size={14} className="shrink-0" />,
        }
    }
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-text-muted">
          <MapPin size={24} />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-text">
          No deliveries assigned
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          You don't have any deliveries scheduled for today yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-text">
          Assigned Deliveries ({orders.length})
        </h2>
        <span className="text-xs text-text-muted">Today's Schedule</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {orders.map((order) => {
          const statusConfig = getStatusConfig(order.status)
          const destination = order.destinationDetails

          return (
            <div
              key={order.id}
              className="flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border-strong"
            >
              <div className="space-y-3.5">
                {/* Header: Order ID & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Delivery Details
                    </span>
                    <h3 className="text-sm font-bold text-text mt-0.5">
                      Order #{order.id.replace('order-', '')}
                    </h3>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.classes}`}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-2.5 text-sm text-text-secondary">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-text">
                      {destination?.name || `Hub ID: ${order.destinationId}`}
                    </div>
                    {destination?.address && (
                      <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                        {destination.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product & Quantity */}
                <div className="flex items-center gap-6 rounded-lg bg-bg-secondary p-3 text-sm border border-border-light">
                  <div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">
                      Product
                    </div>
                    <div className="font-semibold text-text mt-0.5">
                      {formatProduct(order.product)}
                    </div>
                  </div>
                  <div className="h-6 w-px bg-border shrink-0" />
                  <div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">
                      Quantity
                    </div>
                    <div className="font-bold text-primary mt-0.5">
                      {order.quantity.toLocaleString()} L
                    </div>
                  </div>
                </div>
              </div>

              {/* Failure Reason if failed */}
              {order.status === 'failed' && order.failureReason && (
                <div className="mt-4 rounded-lg bg-danger-soft border border-danger-border p-3 text-xs text-danger">
                  <span className="font-bold">Failure Reason:</span>{' '}
                  {order.failureReason}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
