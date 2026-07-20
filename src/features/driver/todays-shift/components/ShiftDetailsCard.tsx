import type { Vehicle, Shift } from '../types/shift.types'
import { Button } from '@/components/ui'
import {
  Truck,
  Play,
  Square,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react'

interface ShiftDetailsCardProps {
  hasAllocation: boolean
  vehicle: Vehicle | null
  shift: Shift | null
  onStartShift: () => void
  onEndShift: () => void
  isStarting: boolean
  isEnding: boolean
}

export function ShiftDetailsCard({
  hasAllocation,
  vehicle,
  shift,
  onStartShift,
  onEndShift,
  isStarting,
  isEnding,
}: ShiftDetailsCardProps) {
  // Format timestamps
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isShiftActive = shift?.status === 'active'
  const isShiftEnded = shift?.status === 'ended'
  const isShiftNotStarted = !shift

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="border-b border-border bg-bg-secondary px-6 py-4">
        <h2 className="text-lg font-bold text-text">
          Today's Allocation & Shift
        </h2>
        <p className="text-xs text-text-muted">
          Your vehicle allocation and active shift state
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Allocation & Vehicle Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-text-muted uppercase">
              Vehicle Allocation
            </h3>
            {hasAllocation && vehicle ? (
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="font-bold text-text text-lg">
                    {vehicle.registration}
                  </div>
                  <div className="text-sm text-text-secondary mt-0.5">
                    Type: <span className="font-medium">{vehicle.type}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    Capacity:{' '}
                    <span className="font-medium">
                      {vehicle.capacity.toLocaleString()} liters
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-warning-border bg-warning-soft p-4 text-warning">
                <AlertTriangle size={20} className="shrink-0" />
                <div>
                  <div className="font-semibold text-sm">
                    No Vehicle Allocated
                  </div>
                  <div className="text-xs mt-0.5 opacity-90">
                    Contact dispatch to assign a vehicle to your route today.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shift State Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-text-muted uppercase">
              Shift Status
            </h3>
            <div className="flex flex-col gap-3">
              {isShiftNotStarted && (
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-text-muted animate-pulse" />
                  <span className="font-medium text-text-secondary">
                    Shift Inactive (Not Started)
                  </span>
                </div>
              )}
              {isShiftActive && (
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-success animate-ping absolute" />
                  <span className="h-3.5 w-3.5 rounded-full bg-success relative" />
                  <span className="font-semibold text-success">
                    Shift Active (In Progress)
                  </span>
                </div>
              )}
              {isShiftEnded && (
                <div className="flex items-center gap-2.5">
                  <span className="h-3.5 w-3.5 rounded-full bg-danger" />
                  <span className="font-semibold text-danger">Shift Ended</span>
                </div>
              )}

              {/* Time Indicators */}
              {(isShiftActive || isShiftEnded) && (
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-bg-secondary p-3.5 text-sm border border-border">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock size={16} className="text-primary" />
                    <div>
                      <div className="text-[10px] text-text-muted uppercase tracking-wider">
                        Started At
                      </div>
                      <div className="font-semibold">
                        {formatTime(shift?.startedAt)}
                      </div>
                    </div>
                  </div>
                  {isShiftEnded && (
                    <div className="flex items-center gap-2 text-text-secondary border-l border-border pl-4">
                      <CheckCircle size={16} className="text-success" />
                      <div>
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">
                          Ended At
                        </div>
                        <div className="font-semibold">
                          {formatTime(shift?.endedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
          {isShiftNotStarted && (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Play size={18} />}
              onClick={onStartShift}
              loading={isStarting}
              disabled={!hasAllocation || isStarting}
              className="px-6 h-12"
            >
              Start Shift
            </Button>
          )}

          {isShiftActive && (
            <Button
              variant="danger"
              size="lg"
              leftIcon={<Square size={16} />}
              onClick={onEndShift}
              loading={isEnding}
              disabled={isEnding}
              className="px-6 h-12"
            >
              End Shift
            </Button>
          )}

          {isShiftEnded && (
            <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
              <CheckCircle size={18} className="text-success" />
              <span>You have completed your shift for today.</span>
            </div>
          )}

          {!hasAllocation && isShiftNotStarted && (
            <span className="text-xs text-text-muted font-medium">
              * Allocation required to start shift
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
