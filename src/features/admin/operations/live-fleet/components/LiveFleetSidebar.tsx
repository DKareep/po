import { useMemo } from 'react'
import { Search, Truck, Phone, ShieldAlert, Navigation } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/select'
import type { LiveFleetResponseItem } from '../api/getLiveFleet'

interface LiveFleetSidebarProps {
  allocations: LiveFleetResponseItem[]
  selectedAllocation: LiveFleetResponseItem | null
  onSelectAllocation: (alloc: LiveFleetResponseItem) => void
  search: string
  onSearchChange: (val: string) => void
  selectedDriverId: string
  onDriverChange: (val: string) => void
  selectedVehicleId: string
  onVehicleChange: (val: string) => void
  selectedStatus: string
  onStatusChange: (val: string) => void
}

export function LiveFleetSidebar({
  allocations,
  selectedAllocation,
  onSelectAllocation,
  search,
  onSearchChange,
  selectedDriverId,
  onDriverChange,
  selectedVehicleId,
  onVehicleChange,
  selectedStatus,
  onStatusChange,
}: LiveFleetSidebarProps) {
  // Extract filter dropdown options from allocations list
  const driverOptions = useMemo(() => {
    const list = allocations
      .map((a) => a.driver)
      .filter((d): d is NonNullable<typeof d> => d !== null)

    // Deduplicate
    const unique = Array.from(
      new Map(list.map((item) => [item.id, item])).values(),
    )

    return [
      { value: 'all', label: 'All Drivers' },
      ...unique.map((d) => ({ value: d.id, label: d.name })),
    ]
  }, [allocations])

  const vehicleOptions = useMemo(() => {
    const list = allocations
      .map((a) => a.vehicle)
      .filter((v): v is NonNullable<typeof v> => v !== null)

    // Deduplicate
    const unique = Array.from(
      new Map(list.map((item) => [item.id, item])).values(),
    )

    return [
      { value: 'all', label: 'All Vehicles' },
      ...unique.map((v) => ({ value: v.id, label: v.registration })),
    ]
  }, [allocations])

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Shift: Active' },
    { value: 'inactive', label: 'Shift: Inactive' },
    { value: 'ended', label: 'Shift: Ended' },
    { value: 'pending', label: 'Delivery: Pending' },
    { value: 'completed', label: 'Delivery: Completed' },
    { value: 'failed', label: 'Delivery: Failed' },
  ]

  // Filter allocations locally for instant reaction
  const filteredAllocations = useMemo(() => {
    return allocations.filter((alloc) => {
      // 1. Text Search Filter (Driver Name or Vehicle Registration)
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchDriver = alloc.driver?.name.toLowerCase().includes(q)
        const matchVehicle = alloc.vehicle?.registration
          .toLowerCase()
          .includes(q)
        if (!matchDriver && !matchVehicle) return false
      }

      // 2. Driver Filter
      if (selectedDriverId !== 'all' && alloc.driver?.id !== selectedDriverId) {
        return false
      }

      // 3. Vehicle Filter
      if (
        selectedVehicleId !== 'all' &&
        alloc.vehicle?.id !== selectedVehicleId
      ) {
        return false
      }

      // 4. Status Filter
      if (selectedStatus !== 'all') {
        const s = selectedStatus.toLowerCase()
        if (s === 'active' || s === 'inactive' || s === 'ended') {
          if (alloc.shiftStatus.toLowerCase() !== s) return false
        } else {
          // Check order statuses
          const hasMatchingOrder = alloc.orders.some((o) => {
            const statusMap: Record<string, string> = {
              pending: 'pending',
              assigned: 'pending',
              completed: 'completed',
              failed: 'failed',
            }
            const orderStatusMapped =
              statusMap[o.status.toLowerCase()] || o.status.toLowerCase()
            return orderStatusMapped === s
          })
          if (!hasMatchingOrder) return false
        }
      }

      return true
    })
  }, [allocations, search, selectedDriverId, selectedVehicleId, selectedStatus])

  return (
    <div className="w-full lg:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-surface/50 backdrop-blur-md overflow-hidden shrink-0 h-full">
      {/* Header Info */}
      <div className="p-5 border-b border-border space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-success-soft/20 border border-success-border/30 rounded-lg p-2">
            <span className="block text-xs font-semibold text-success ">
              {allocations.filter((a) => a.shiftStatus === 'active').length}
            </span>
            <span className="text-[9px] font-bold text-text-muted uppercase">
              Active
            </span>
          </div>
          <div className="bg-bg-secondary border border-border rounded-lg p-2">
            <span className="block text-xs font-semibold text-text ">
              {allocations.length}
            </span>
            <span className="text-[9px] font-bold text-text-muted uppercase">
              Total
            </span>
          </div>
          <div className="bg-warning-soft/25 border border-warning-border/20 rounded-lg p-2">
            <span className="block text-xs font-semibold text-warning ">
              {
                allocations
                  .flatMap((a) => a.orders)
                  .filter(
                    (o) => o.status === 'assigned' || o.status === 'pending',
                  ).length
              }
            </span>
            <span className="text-[9px] font-bold text-text-muted uppercase">
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="p-4 border-b border-border bg-surface space-y-3 shrink-0">
        <Input
          placeholder="Search driver or vehicle..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search size={16} />}
          inputSize="sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <Select
            value={selectedDriverId}
            options={driverOptions}
            onValueChange={onDriverChange}
            placeholder="Driver"
            className="h-9 min-h-[36px]"
          />
          <Select
            value={selectedVehicleId}
            options={vehicleOptions}
            onValueChange={onVehicleChange}
            placeholder="Vehicle"
            className="h-9 min-h-[36px]"
          />
        </div>

        <Select
          value={selectedStatus}
          options={statusOptions}
          onValueChange={onStatusChange}
          placeholder="All Statuses"
          className="h-9 min-h-[36px]"
        />
      </div>

      {/* Help Note */}
      <div className="px-4 py-2.5 bg-primary/5 border-b border-border text-[11px] text-text-muted flex items-center gap-1.5 shrink-0">
        <span className="text-primary text-xs">💡</span>
        <span>Click on a vehicle card to zoom in and display its route.</span>
      </div>

      {/* Vehicles list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg-secondary/40">
        {filteredAllocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-surface/50 mt-4">
            <ShieldAlert
              size={24}
              className="text-text-muted mb-2 animate-bounce"
            />
            <span className="text-sm font-semibold text-text">
              No active vehicles found
            </span>
            <span className="text-xs text-text-muted mt-1">
              Try resetting the filters.
            </span>
          </div>
        ) : (
          filteredAllocations.map((alloc) => {
            const isSelected =
              selectedAllocation?.allocationId === alloc.allocationId

            // Calculate progress of orders
            const totalOrders = alloc.orders.length
            const completedOrders = alloc.orders.filter(
              (o) => o.status === 'completed',
            ).length
            const failedOrders = alloc.orders.filter(
              (o) => o.status === 'failed',
            ).length
            const progressPercent =
              totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0

            // Determine active order destination
            const activeOrder = alloc.orders.find(
              (o) => o.status === 'assigned' || o.status === 'pending',
            )

            return (
              <div
                key={alloc.allocationId}
                onClick={() => onSelectAllocation(alloc)}
                className={`group border rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden ${
                  isSelected
                    ? 'border-primary bg-primary-soft/10 ring-1 ring-primary/30'
                    : 'border-border bg-surface hover:bg-surface-hover hover:border-border-strong'
                }`}
              >
                {/* Visual glow on selection */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                )}

                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-text truncate group-hover:text-primary transition-colors">
                      {alloc.driver?.name || 'Unassigned'}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted ">
                      <Truck size={12} className="text-text-muted shrink-0" />
                      <span>{alloc.vehicle?.registration}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-bg-secondary rounded text-text-secondary border border-border">
                        {alloc.vehicle?.type}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      alloc.shiftStatus === 'active'
                        ? 'bg-success/15 text-success border border-success-border/30 animate-pulse'
                        : alloc.shiftStatus === 'ended'
                          ? 'bg-info/10 text-info border border-info-border/30'
                          : 'bg-text-secondary/10 text-text-secondary border border-border'
                    }`}
                  >
                    {alloc.shiftStatus === 'active'
                      ? 'Active'
                      : alloc.shiftStatus === 'ended'
                        ? 'Ended'
                        : 'Off Duty'}
                  </span>
                </div>

                {/* Driver Info Quick Bar */}
                {alloc.driver?.phone && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary mb-3 font-semibold">
                    <Phone size={11} className="text-text-muted shrink-0" />
                    <a
                      href={`tel:${alloc.driver.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      {alloc.driver.phone}
                    </a>
                  </div>
                )}

                {/* Progress bar */}
                {totalOrders > 0 ? (
                  <div className="space-y-1.5 border-t border-border/40 pt-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary font-medium">
                        Deliveries progress
                      </span>
                      <span className="font-bold text-text ">
                        {completedOrders}/{totalOrders} Done
                        {failedOrders > 0 && (
                          <span className="text-danger ml-1">
                            ({failedOrders} failed)
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="w-full bg-bg-secondary rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Next stop indicator */}
                    {activeOrder && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted mt-2 truncate bg-bg-secondary/60 py-1 px-2 rounded border border-border/40">
                        <Navigation
                          size={10}
                          className="rotate-45 text-primary shrink-0"
                        />
                        <span className="truncate">
                          Next stop: Hub ID {activeOrder.destinationId}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[10px] text-text-muted italic border-t border-border/40 pt-2 text-center">
                    No orders scheduled for this shift.
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
