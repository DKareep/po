import { useState } from 'react'
import { useLiveFleetQuery } from '../hooks/useLiveFleetQuery'
import { LiveFleetSidebar } from '../components/LiveFleetSidebar'
import { LiveFleetMap } from '../components/LiveFleetMap'
import { RefreshTimer } from '../components/RefreshTimer'
import { Spinner } from '@/components/ui'
import { ShieldAlert } from 'lucide-react'

export default function LiveFleetPage() {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<
    number | false
  >(30000)
  const [selectedAllocationId, setSelectedAllocationId] = useState<
    string | null
  >(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [selectedDriverId, setSelectedDriverId] = useState('all')
  const [selectedVehicleId, setSelectedVehicleId] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Query hook
  const {
    fleetData = [],
    hubsData = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useLiveFleetQuery(autoRefreshInterval)

  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list')

  // Find currently selected allocation from list, defaulting to the first
  // active shift (or the first allocation) until the user picks one.
  const selectedAllocation =
    fleetData.find((a) => a.allocationId === selectedAllocationId) ||
    fleetData.find((a) => a.shiftStatus === 'active') ||
    fleetData[0] ||
    null

  const handleSelectAllocation = (alloc: (typeof fleetData)[number]) => {
    setSelectedAllocationId(alloc.allocationId)
    setActiveTab('map') // Auto-switch to Map tab on mobile view when a vehicle card is clicked!
  }

  const handleIntervalChange = (val: number | false) => {
    setAutoRefreshInterval(val)
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center bg-bg rounded-xl border border-border">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-primary" />
          <span className="text-sm font-semibold text-text-secondary">
            Loading live fleet data...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-6rem)] w-full items-center justify-center bg-bg rounded-xl border border-border p-6 text-center">
        <div className="flex flex-col items-center gap-3 max-w-sm">
          <ShieldAlert size={40} className="text-danger animate-bounce" />
          <span className="text-lg font-black text-text">
            Error loading live fleet
          </span>
          <span className="text-xs text-text-muted">
            {error instanceof Error
              ? error.message
              : 'Could not fetch data from the server. Check your connection.'}
          </span>
          <button
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-hover px-4 py-2 text-xs font-semibold text-text-inverse transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
          Live Fleet
        </h1>
        <p className="text-sm text-text-muted mt-1.5">
          Real-time tracking of active vehicles and driver locations.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full overflow-hidden bg-bg rounded-xl border border-border">
        {/* Mobile Tab Switcher Header (hidden on desktop) */}
        <div className="flex lg:hidden w-full border-b border-border bg-surface shrink-0 p-2 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center border ${
              activeTab === 'list'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center border ${
              activeTab === 'map'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
            }`}
          >
            Map View
          </button>
        </div>

        {/* Sidebar List and Filters Container */}
        <div
          className={`w-full lg:w-96 shrink-0 h-full ${activeTab === 'list' ? 'block' : 'hidden lg:block'}`}
        >
          <LiveFleetSidebar
            allocations={fleetData}
            selectedAllocation={selectedAllocation}
            onSelectAllocation={handleSelectAllocation}
            search={search}
            onSearchChange={setSearch}
            selectedDriverId={selectedDriverId}
            onDriverChange={setSelectedDriverId}
            selectedVehicleId={selectedVehicleId}
            onVehicleChange={setSelectedVehicleId}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </div>

        {/* Main Map tracking area Container */}
        <div
          className={`flex-1 h-full w-full relative ${activeTab === 'map' ? 'block' : 'hidden lg:block'}`}
        >
          <LiveFleetMap
            allocations={fleetData}
            hubs={hubsData}
            selectedAllocation={selectedAllocation}
            onSelectAllocation={handleSelectAllocation}
          />

          {/* Floating Refresh Control Widget */}
          <div className="absolute top-4 right-4 z-10">
            <RefreshTimer
              onRefresh={refetch}
              isRefetching={isRefetching}
              autoRefreshInterval={30000}
              onIntervalChange={handleIntervalChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export type { LiveFleetPage }
