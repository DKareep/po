import { useState } from 'react'
import { useShiftHistory } from './hooks/useShiftHistory'
import { Spinner } from '@/components/ui'
import {
  Calendar,
  Truck,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const pageSize = 5

  const { data, isLoading, error, refetch, isRefetching } = useShiftHistory({
    page,
    pageSize,
  })

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const date = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    )
    return date.toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return ''
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (startStr: string, endStr: string | null) => {
    if (!endStr) return 'Ongoing'
    const diffMs = new Date(endStr).getTime() - new Date(startStr).getTime()
    if (diffMs < 0) return '0m'
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <span className="text-sm font-medium text-text-secondary animate-pulse">
          Loading shift logs and metrics...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-danger-border bg-danger-soft p-6 text-center shadow-md my-12">
        <h3 className="text-lg font-bold text-danger">
          Failed to load shift history
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {error instanceof Error
            ? error.message
            : 'Failed to query historical shift data.'}
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

  const shifts = data.data
  const pagination = data.pagination
  const totalPages = pagination.totalPages

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Shift History
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Logs of your past work shifts and delivery performance metrics
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-hover transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isRefetching ? 'animate-spin' : ''} />
          <span>{isRefetching ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Shifts Listing */}
      {shifts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm max-w-md mx-auto">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg-secondary text-text-muted">
            <Calendar size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-text">
            No shift history found
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            You haven't logged any shifts in our database yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {shifts.map((shift) => {
            const isCompletedAll =
              shift.stats.totalDeliveries > 0 &&
              shift.stats.completedDeliveries === shift.stats.totalDeliveries
            const successRate =
              shift.stats.totalDeliveries > 0
                ? (shift.stats.completedDeliveries /
                    shift.stats.totalDeliveries) *
                  100
                : 0

            return (
              <div
                key={shift.id}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all duration-300 hover:shadow-md"
              >
                {/* Shift Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-bg-secondary px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-primary" />
                    <span className="font-extrabold text-text text-sm sm:text-base">
                      {formatDate(shift.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                        shift.status === 'ended'
                          ? 'bg-success-soft text-success border-success-border'
                          : 'bg-info-soft text-info border-info-border animate-pulse'
                      }`}
                    >
                      {shift.status}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid gap-6 md:grid-cols-3">
                  {/* Left: Vehicle Details */}
                  <div className="space-y-3.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Vehicle Used
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-secondary text-text-secondary border border-border-light">
                        <Truck size={20} />
                      </div>
                      <div>
                        <div className="font-extrabold text-text text-sm">
                          {shift.vehicleRegistration}
                        </div>
                        {shift.vehicleType && (
                          <div className="text-xs text-text-muted mt-0.5">
                            Type:{' '}
                            <span className="font-medium">
                              {shift.vehicleType}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Shift Time/Duration */}
                  <div className="space-y-3.5 md:border-l md:border-border md:pl-6">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Shift Duration
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg-secondary text-text-secondary border border-border-light">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="font-extrabold text-text text-sm">
                          {formatDuration(shift.startedAt, shift.endedAt)}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          {formatTime(shift.startedAt)}
                          {shift.endedAt
                            ? ` - ${formatTime(shift.endedAt)}`
                            : ' (Ongoing)'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Deliveries Completed stats */}
                  <div className="space-y-3.5 md:border-l md:border-border md:pl-6">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                        Deliveries Status
                      </div>
                      {isCompletedAll && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-success uppercase">
                          <TrendingUp size={10} /> Perfect Run
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-extrabold text-text">
                          {shift.stats.completedDeliveries} /{' '}
                          {shift.stats.totalDeliveries}{' '}
                          <span className="text-xs font-semibold text-text-muted">
                            Completed
                          </span>
                        </span>
                        {shift.stats.failedDeliveries > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger">
                            <XCircle size={12} />
                            <span>{shift.stats.failedDeliveries} failed</span>
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-bg-secondary overflow-hidden border border-border-light">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompletedAll
                              ? 'bg-success'
                              : shift.stats.failedDeliveries > 0
                                ? 'bg-warning'
                                : 'bg-primary'
                          }`}
                          style={{
                            width: `${shift.stats.totalDeliveries > 0 ? successRate : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="text-sm font-semibold text-text-secondary">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
