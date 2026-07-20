import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTodaysShift } from '../todays-shift/hooks/useTodaysShift'
import { useEndShift } from '../todays-shift/hooks/useEndShift'
import { useCompleteDelivery } from './hooks/useCompleteDelivery'
import { useFailDelivery } from './hooks/useFailDelivery'
import { FailReasonModal } from './components/FailReasonModal'
import { Button, Spinner } from '@/components/ui'
import { toast } from 'sonner'
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  AlertTriangle,
  LogOut,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import type {
  DriverOrder,
  OrderStatus,
} from '../todays-shift/types/shift.types'

export default function DeliveriesPage() {
  const { data, isLoading, error, refetch, isRefetching } = useTodaysShift()
  const { mutate: endShiftMutate, isPending: isEnding } = useEndShift()
  const { mutate: completeMutate, isPending: isCompleting } =
    useCompleteDelivery()
  const { mutate: failMutate, isPending: isFailing } = useFailDelivery()

  const [failingOrder, setFailingOrder] = useState<DriverOrder | null>(null)

  const handleEndShift = () => {
    endShiftMutate(undefined, {
      onSuccess: () => {
        toast.success('Shift ended successfully!')
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { error?: string } }
          message?: string
        }
        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            'Failed to end shift',
        )
      },
    })
  }

  const handleCompleteDelivery = (order: DriverOrder) => {
    completeMutate(order.id, {
      onSuccess: (res) => {
        const hubName = res.inventoryUpdated?.hubName || 'Destination Hub'
        const product = res.inventoryUpdated?.product || order.product
        const newStock = res.inventoryUpdated?.newStock

        toast.success(
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-success">
              Delivery Completed!
            </span>
            <span className="text-xs text-text-secondary">
              {hubName} stock updated: {newStock?.toLocaleString() || '--'} gal
              of {product.toLowerCase()}
            </span>
          </div>,
          { duration: 5000 },
        )
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { error?: string } }
          message?: string
        }
        toast.error(
          error?.response?.data?.error ||
            error?.message ||
            'Failed to complete delivery',
        )
      },
    })
  }

  const handleFailSubmit = (reason: string) => {
    if (!failingOrder) return

    failMutate(
      { id: failingOrder.id, reason },
      {
        onSuccess: () => {
          toast.error(`Delivery marked as Failed (Reason: ${reason})`)
          setFailingOrder(null)
        },
        onError: (err: unknown) => {
          const error = err as {
            response?: { data?: { error?: string } }
            message?: string
          }
          toast.error(
            error?.response?.data?.error ||
              error?.message ||
              'Failed to update delivery',
          )
        },
      },
    )
  }

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
          icon: <Compass size={14} className="shrink-0 text-info" />,
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <span className="text-sm font-medium text-text-secondary animate-pulse">
          Loading assigned deliveries...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-danger-border bg-danger-soft p-6 text-center shadow-md my-12">
        <h3 className="text-lg font-bold text-danger">
          Failed to load deliveries
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {error instanceof Error
            ? error.message
            : 'Failed to retrieve delivery data.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-danger-hover transition-colors"
        >
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    )
  }

  const isShiftActive = data.shift?.status === 'active'
  const isShiftEnded = data.shift?.status === 'ended'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header View */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Delivery Management
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">Deliveries Schedule</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefetching ? 'animate-spin' : ''}
            />
            <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {isShiftActive && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<LogOut size={14} />}
              onClick={handleEndShift}
              loading={isEnding}
              disabled={isEnding}
            >
              End Shift
            </Button>
          )}
        </div>
      </div>

      {/* Shift State Warnings */}
      {!isShiftActive && (
        <div className="rounded-xl border border-warning-border bg-warning-soft p-5 text-warning flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle size={22} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Shift is Inactive</div>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed max-w-2xl">
                {isShiftEnded
                  ? 'Your shift has ended for today. All delivery management controls are disabled.'
                  : 'You must start your shift to log deliveries. Start your shift now from the shift page.'}
              </p>
            </div>
          </div>
          {!isShiftEnded && (
            <Link
              to="/driver"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-warning hover:bg-warning-hover text-text-inverse font-bold text-xs px-4 py-2 shadow-sm transition-colors"
            >
              Go to Today's Shift
            </Link>
          )}
        </div>
      )}

      {/* Deliveries List */}
      {data.orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm max-w-lg mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary text-text-muted">
            <MapPin size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-text">
            No assigned deliveries today
          </h3>
          <p className="mt-1 text-xs text-text-muted max-w-xs mx-auto">
            Contact dispatch if you think this is a mistake or wait for orders
            to be assigned.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {data.orders.map((order) => {
            const statusConfig = getStatusConfig(order.status)
            const destination = order.destinationDetails
            const isCompleted = order.status === 'completed'
            const isFailed = order.status === 'failed'
            const isSettled = isCompleted || isFailed

            return (
              <div
                key={order.id}
                className={`relative flex flex-col justify-between rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 ${
                  isSettled
                    ? 'opacity-85 border-border-light'
                    : 'hover:shadow-md hover:border-border-strong'
                }`}
              >
                <div className="space-y-4">
                  {/* Header: Order ID & Status */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Delivery Record
                      </span>
                      <h3 className="text-base font-extrabold text-text mt-0.5">
                        Order #{order.id.replace('order-', '')}
                      </h3>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusConfig.classes}`}
                    >
                      {statusConfig.icon}
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="flex items-start gap-3 text-sm text-text-secondary">
                    <MapPin
                      size={18}
                      className="text-primary mt-0.5 shrink-0"
                    />
                    <div>
                      <div className="font-extrabold text-text">
                        {destination?.name || `Hub ID: ${order.destinationId}`}
                      </div>
                      {destination?.address && (
                        <p className="text-xs text-text-muted mt-1 leading-relaxed">
                          {destination.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Product & Quantity */}
                  <div className="flex items-center gap-8 rounded-lg bg-bg-secondary p-4 text-sm border border-border-light">
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">
                        Product
                      </div>
                      <div className="font-bold text-text mt-1">
                        {formatProduct(order.product)}
                      </div>
                    </div>
                    <div className="h-8 w-px bg-border shrink-0" />
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">
                        Quantity
                      </div>
                      <div className="font-extrabold text-primary mt-1">
                        {order.quantity.toLocaleString()} gal
                      </div>
                    </div>
                  </div>

                  {/* Failure reason if failed */}
                  {isFailed && order.failureReason && (
                    <div className="rounded-lg bg-danger-soft border border-danger-border p-3.5 text-xs text-danger leading-relaxed">
                      <span className="font-bold">Failure Reason:</span>{' '}
                      {order.failureReason}
                    </div>
                  )}
                </div>

                {/* Action Controls */}
                {!isSettled && (
                  <div className="mt-6 pt-4 border-t border-border flex gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleCompleteDelivery(order)}
                      loading={isCompleting}
                      disabled={!isShiftActive || isCompleting || isFailing}
                    >
                      Mark Completed
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      onClick={() => setFailingOrder(order)}
                      loading={isFailing}
                      disabled={!isShiftActive || isCompleting || isFailing}
                    >
                      Mark Failed
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Failure Reason input modal */}
      {failingOrder && (
        <FailReasonModal
          open={!!failingOrder}
          onClose={() => setFailingOrder(null)}
          onSubmit={handleFailSubmit}
          isSubmitting={isFailing}
          orderId={failingOrder.id}
        />
      )}
    </div>
  )
}
