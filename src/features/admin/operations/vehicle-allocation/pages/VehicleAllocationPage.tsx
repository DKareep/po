import { useRef, useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Plus,
  CalendarDays,
  Truck,
  Users,
  ShieldAlert,
  Award,
} from 'lucide-react'

// FullCalendar Imports
import FullCalendar from '@fullcalendar/react'
import type {
  CalendarRef,
  DateClickInfo,
  EventClickInfo,
  EventDropInfo,
} from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import interactionPlugin from '@fullcalendar/react/interaction'
import classicThemePlugin from '@fullcalendar/react/themes/classic'

// Hooks & API
import { useAllocations } from '../hooks/useAllocations'
import { useCreateAllocation } from '../hooks/useCreateAllocation'
import { useUpdateAllocation } from '../hooks/useUpdateAllocation'
import { getDrivers } from '@/features/admin/resources/drivers/api/getDrivers'
import { getVehicles } from '@/features/admin/resources/vehicles/api/getvehicles'
import { getErrorMessage } from '@/utils/errors'

// Components
import { Button, Spinner } from '@/components/ui'
import { Select } from '@/components/ui/select/Select'
import { Input } from '@/components/ui/Input'
import { AllocationModal } from '../components/AllocationModal'
import { DragConfirmModal } from '../components/DragConfirmModal'
import type { Allocation } from '../types'

// Styling
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import '@fullcalendar/react/themes/classic/palette.css'
import '../styles/calendar.css'

interface PendingDrag {
  allocationId: string
  vehicleReg: string
  driverName: string
  oldDate: string
  newDate: string
  revert: () => void
}

// Remembers the last month the user viewed so returning to this page
// (e.g. after navigating away and back) doesn't reset the calendar to today.
let lastViewedDate: Date | undefined

export default function VehicleAllocationPage() {
  const lastViewTypeRef = useRef<string>('dayGridMonth')
  const calendarRef = useRef<CalendarRef>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAllocation, setSelectedAllocation] =
    useState<Allocation | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [pendingDrag, setPendingDrag] = useState<PendingDrag | null>(null)

  // Sidebar Form State
  const [quickVehicleId, setQuickVehicleId] = useState('')
  const [quickDriverId, setQuickDriverId] = useState('')
  const [quickDate, setQuickDate] = useState(
    new Date().toISOString().split('T')[0],
  )

  // Queries
  const allocationsQuery = useAllocations()
  const createMutation = useCreateAllocation()
  const updateMutation = useUpdateAllocation()

  // Fetch lists for Sidebar Select inputs
  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers-sidebar-list'],
    queryFn: () => getDrivers({ page: 1, pageSize: 1000 }),
  })

  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles-sidebar-list'],
    queryFn: () => getVehicles({ page: 1, pageSize: 1000 }),
  })

  const driversList = driversData?.data ?? []
  const vehiclesList = vehiclesData?.data ?? []

  const driverOptions = useMemo(
    () => driversList.map((d) => ({ value: d.id, label: d.name })),
    [driversList],
  )

  const vehicleOptions = useMemo(
    () =>
      vehiclesList.map((v) => ({
        value: v.id,
        label: `${v.registration} (${v.type})`,
      })),
    [vehiclesList],
  )

  // Calendar events mapper
  const events = useMemo(() => {
    const list = allocationsQuery.data?.data ?? []
    return list.map((a) => ({
      id: a.id,
      title: `${a.vehicleDetails?.registration ?? 'Truck'} \u2014 ${a.driverDetails?.name ?? 'Driver'}`,
      start: a.date,
      allDay: true,
      extendedProps: {
        allocation: a,
      },
    }))
  }, [allocationsQuery.data])

  // FullCalendar's events land in its internal store right away (confirmed
  // via getApi().getEvents()), but the view doesn't reliably repaint them —
  // only a genuine view-type change does, and even that is racy against
  // this library's internal render scheduling (confirmed: identical
  // month->week->month toggle succeeded on one attempt and failed on
  // another). So instead of assuming a fixed number of frames is enough, we
  // toggle the view and then poll actual rendered text for confirmation,
  // retrying the toggle if it hasn't shown up yet, up to a bounded number
  // of attempts.
  const [calendarReady, setCalendarReady] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCalendarReady(!!allocationsQuery.data)
  }, [allocationsQuery.data])

  useEffect(() => {
    if (!calendarReady || events.length === 0) return

    const api = calendarRef.current?.getApi()
    if (!api) return

    api.setOption('events', events)

    const currentView = api.view.type
    const otherView =
      currentView === 'dayGridMonth' ? 'dayGridWeek' : 'dayGridMonth'
    const sampleTitle = events[0].title

    let cancelled = false
    let attempts = 0
    const maxAttempts = 6

    const isPainted = () => document.body.innerText.includes(sampleTitle)

    const attemptToggle = () => {
      if (cancelled) return
      attempts += 1
      // Prevent the datesSet "jump to today" logic (meant for a genuine
      // user-initiated switch into week view) from firing during this
      // internal, invisible round-trip through dayGridWeek.
      lastViewTypeRef.current = otherView
      api.changeView(otherView)
      requestAnimationFrame(() => {
        if (cancelled) return
        api.changeView(currentView)
        requestAnimationFrame(checkAndMaybeRetry)
      })
    }

    const checkAndMaybeRetry = () => {
      if (cancelled) return
      if (isPainted() || attempts >= maxAttempts) return
      attemptToggle()
    }

    attemptToggle()

    return () => {
      cancelled = true
    }
  }, [events, calendarReady])

  // Stats calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const list = allocationsQuery.data?.data ?? []
    const todayAllocations = list.filter((a) => a.date === todayStr)

    return {
      total: list.length,
      today: todayAllocations.length,
      activeVehicles: new Set(todayAllocations.map((a) => a.vehicleId)).size,
      activeDrivers: new Set(todayAllocations.map((a) => a.driverId)).size,
    }
  }, [allocationsQuery.data])

  // Drag and drop event drops
  const handleEventDrop = (info: EventDropInfo) => {
    const event = info.event
    const oldDate = info.oldEvent.startStr.split('T')[0]
    const newDate = event.startStr.split('T')[0]
    const allocation = event.extendedProps.allocation as Allocation

    setPendingDrag({
      allocationId: allocation.id,
      vehicleReg: allocation.vehicleDetails?.registration ?? 'Unknown Vehicle',
      driverName: allocation.driverDetails?.name ?? 'Unknown Driver',
      oldDate,
      newDate,
      revert: info.revert,
    })
  }

  // Drag execution
  const confirmDrag = async () => {
    if (!pendingDrag) return

    try {
      await updateMutation.mutateAsync({
        id: pendingDrag.allocationId,
        date: pendingDrag.newDate,
      })
      toast.success('Allocation rescheduled successfully')
      setPendingDrag(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reschedule allocation'), {
        duration: 5000,
      })
      pendingDrag.revert()
      setPendingDrag(null)
    }
  }

  const cancelDrag = () => {
    if (pendingDrag) {
      pendingDrag.revert()
      setPendingDrag(null)
    }
  }

  // Click on date slot
  const handleDateClick = (info: DateClickInfo) => {
    setSelectedDate(info.dateStr)
    setSelectedAllocation(null)
    setModalOpen(true)
  }

  // Click on event details
  const handleEventClick = (info: EventClickInfo) => {
    const allocation = info.event.extendedProps.allocation as Allocation
    setSelectedAllocation(allocation)
    setModalOpen(true)
  }

  // Quick allocation execution
  const handleQuickAllocate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quickVehicleId || !quickDriverId || !quickDate) {
      toast.error('Please complete all quick allocation fields')
      return
    }

    try {
      await createMutation.mutateAsync({
        vehicleId: quickVehicleId,
        driverId: quickDriverId,
        date: quickDate,
      })
      toast.success('Vehicle allocated successfully')
      setQuickVehicleId('')
      setQuickDriverId('')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Allocation failed'), {
        duration: 5000,
      })
    }
  }

  const isLoadingData =
    allocationsQuery.isLoading || loadingDrivers || loadingVehicles

  return (
    <div className="space-y-8 pt-2 sm:pt-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Vehicle Allocations
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Manage and schedule vehicle-to-driver assignments. Drag & drop
            events to reschedule them.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAllocation(null)
            setSelectedDate(new Date().toISOString().split('T')[0])
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5"
        >
          <Plus size={16} />
          Create Allocation
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 rounded-lg bg-primary-soft text-primary">
            <CalendarDays size={22} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">
              Total Allocations
            </p>
            <h3 className="text-2xl font-bold text-text mt-0.5">
              {isLoadingData ? '...' : stats.total}
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 rounded-lg bg-success-soft text-success">
            <Award size={22} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">
              Allocations Today
            </p>
            <h3 className="text-2xl font-bold text-text mt-0.5">
              {isLoadingData ? '...' : stats.today}
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 rounded-lg bg-info-soft text-info">
            <Truck size={22} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">
              Active Trucks Today
            </p>
            <h3 className="text-2xl font-bold text-text mt-0.5">
              {isLoadingData ? '...' : stats.activeVehicles}
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex items-center gap-5">
          <div className="p-3.5 rounded-lg bg-warning-soft text-warning">
            <Users size={22} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-medium">
              Active Drivers Today
            </p>
            <h3 className="text-2xl font-bold text-text mt-0.5">
              {isLoadingData ? '...' : stats.activeDrivers}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Quick Allocation Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-text mb-4">
              Quick Allocate
            </h3>
            <form onSubmit={handleQuickAllocate} className="space-y-4">
              <Select
                label="Vehicle"
                placeholder="Select vehicle..."
                value={quickVehicleId}
                options={vehicleOptions}
                onValueChange={setQuickVehicleId}
                name="quick-vehicle"
              />

              <Select
                label="Driver"
                placeholder="Select driver..."
                value={quickDriverId}
                options={driverOptions}
                onValueChange={setQuickDriverId}
                name="quick-driver"
              />

              <Input
                label="Allocation Date"
                type="date"
                value={quickDate}
                onChange={(e) => setQuickDate(e.target.value)}
                leftIcon={<CalendarDays size={16} />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={createMutation.isPending || isLoadingData}
                className="mt-2"
              >
                {createMutation.isPending ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  'Allocate Driver'
                )}
              </Button>
            </form>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-text">
                  Scheduling Rules
                </h4>
                <ul className="text-xs text-text-secondary mt-2 space-y-1.5 list-disc pl-4">
                  <li>
                    Each vehicle can only be allocated to one driver per day.
                  </li>
                  <li>Each driver can only operate one vehicle per day.</li>
                  <li>
                    You can drag and drop allocations on the calendar to
                    reschedule them. Confirmations prevent accidental updates.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Calendar View */}
        <div className="lg:col-span-8 bg-surface rounded-xl shadow-sm relative min-h-[400px]">
          {!calendarReady && (
            <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 rounded-xl">
              <Spinner size="lg" className="text-primary" />
              <p className="text-sm font-medium text-text-muted mt-3">
                Loading calendar data...
              </p>
            </div>
          )}

          <div className="p-2 sm:p-4">
            {calendarReady && (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, interactionPlugin, classicThemePlugin]}
                initialView="dayGridMonth"
                initialDate={lastViewedDate}
                datesSet={(arg) => {
                  lastViewedDate = arg.view.currentStart

                  if (
                    arg.view.type === 'dayGridWeek' &&
                    lastViewTypeRef.current !== 'dayGridWeek'
                  ) {
                    lastViewTypeRef.current = arg.view.type
                    arg.view.calendar.today()
                    return
                  }

                  lastViewTypeRef.current = arg.view.type
                }}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek',
                }}
                events={events}
                editable={true}
                selectable={true}
                eventDrop={handleEventDrop}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                height="auto"
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  meridiem: false,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Allocation creation/edit modal */}
      <AllocationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        allocation={selectedAllocation}
        defaultDate={selectedDate}
      />

      {/* Reschedule confirmation modal */}
      <DragConfirmModal
        open={!!pendingDrag}
        onClose={cancelDrag}
        onConfirm={confirmDrag}
        driverName={pendingDrag?.driverName}
        vehicleReg={pendingDrag?.vehicleReg}
        oldDate={pendingDrag?.oldDate ?? ''}
        newDate={pendingDrag?.newDate ?? ''}
      />
    </div>
  )
}
