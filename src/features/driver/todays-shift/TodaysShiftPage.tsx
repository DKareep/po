import { useTodaysShift } from './hooks/useTodaysShift'
import { useStartShift } from './hooks/useStartShift'
import { useEndShift } from './hooks/useEndShift'
import { ShiftDetailsCard } from './components/ShiftDetailsCard'
import { DeliveryList } from './components/DeliveryList'
import { Spinner } from '@/components/ui'
import { toast } from 'sonner'
import { Calendar, RefreshCw } from 'lucide-react'

export default function TodaysShiftPage() {
  const { data, isLoading, error, refetch, isRefetching } = useTodaysShift()
  const { mutate: startShiftMutate, isPending: isStarting } = useStartShift()
  const { mutate: endShiftMutate, isPending: isEnding } = useEndShift()

  const handleStartShift = () => {
    startShiftMutate(undefined, {
      onSuccess: () => {
        toast.success('Shift started successfully!')
      },
      onError: (err: unknown) => {
        const error = err as {
          response?: { data?: { error?: string } }
          message?: string
        }
        const errMsg =
          error?.response?.data?.error ||
          error?.message ||
          'Failed to start shift'
        toast.error(errMsg)
      },
    })
  }

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
        const errMsg =
          error?.response?.data?.error ||
          error?.message ||
          'Failed to end shift'
        toast.error(errMsg)
      },
    })
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    // Parse the dateStr (which is YYYY-MM-DD) avoiding timezone issues
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const date = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    )
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <span className="text-sm font-medium text-text-secondary animate-pulse">
          Retrieving today's shift configuration...
        </span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-danger-border bg-danger-soft p-6 text-center shadow-md my-12">
        <h3 className="text-lg font-bold text-danger">
          Failed to load today's shift
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {error instanceof Error
            ? error.message
            : 'An unexpected error occurred while fetching shift data.'}
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

  return (
    <div className="space-y-6">
      {/* Page Title & Subheader */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Today's Shift
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
            <Calendar size={16} className="text-primary" />
            <span className="font-medium">{formatDate(data.date)}</span>
          </div>
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

      {/* Today's Shift & Allocation Details Card */}
      <ShiftDetailsCard
        hasAllocation={data.hasAllocation}
        vehicle={data.vehicle}
        shift={data.shift}
        onStartShift={handleStartShift}
        onEndShift={handleEndShift}
        isStarting={isStarting}
        isEnding={isEnding}
      />

      {/* Deliveries List */}
      <DeliveryList orders={data.orders} />
    </div>
  )
}
