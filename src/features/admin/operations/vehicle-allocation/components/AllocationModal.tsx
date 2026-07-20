import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Calendar as CalendarIcon, Truck, User } from 'lucide-react'

import { Modal } from '@/components/ui/Modal'
import { Button, Spinner } from '@/components/ui'
import { Select } from '@/components/ui/select/Select'
import { Input } from '@/components/ui/Input'

import { getDrivers } from '@/features/admin/resources/drivers/api/getDrivers'
import { getVehicles } from '@/features/admin/resources/vehicles/api/getvehicles'
import { getErrorMessage } from '@/utils/errors'

import { useCreateAllocation } from '../hooks/useCreateAllocation'
import { useUpdateAllocation } from '../hooks/useUpdateAllocation'
import { useDeleteAllocation } from '../hooks/useDeleteAllocation'
import type { Allocation } from '../types'

interface AllocationModalProps {
  open: boolean
  onClose: () => void
  allocation?: Allocation | null
  defaultDate?: string
}

export function AllocationModal({
  open,
  onClose,
  allocation = null,
  defaultDate = '',
}: AllocationModalProps) {
  const isEditMode = !!allocation

  // Form State
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [date, setDate] = useState('')

  // Mutations
  const createMutation = useCreateAllocation()
  const updateMutation = useUpdateAllocation()
  const deleteMutation = useDeleteAllocation()

  // Reset form when modal opens/changes mode
  useEffect(() => {
    if (open) {
      if (allocation) {
        // Resets the form fields to match the allocation being edited
        // whenever the modal is (re)opened.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVehicleId(allocation.vehicleId)
        setDriverId(allocation.driverId)
        setDate(allocation.date)
      } else {
        setVehicleId('')
        setDriverId('')
        setDate(defaultDate || new Date().toISOString().split('T')[0])
      }
    }
  }, [open, allocation, defaultDate])

  // Fetch all drivers for select dropdown
  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers-select-list'],
    queryFn: () => getDrivers({ page: 1, pageSize: 1000 }),
    enabled: open,
  })

  // Fetch all vehicles for select dropdown
  const { data: vehiclesData, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles-select-list'],
    queryFn: () => getVehicles({ page: 1, pageSize: 1000 }),
    enabled: open,
  })

  const driversList = driversData?.data ?? []
  const vehiclesList = vehiclesData?.data ?? []

  const driverOptions = driversList.map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const vehicleOptions = vehiclesList.map((v) => ({
    value: v.id,
    label: `${v.registration} (${v.type} - Cap: ${v.capacity}L)`,
  }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vehicleId || !driverId || !date) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      if (isEditMode && allocation) {
        await updateMutation.mutateAsync({
          id: allocation.id,
          vehicleId,
          driverId,
          date,
        })
        toast.success('Allocation updated successfully')
      } else {
        await createMutation.mutateAsync({
          vehicleId,
          driverId,
          date,
        })
        toast.success('Vehicle allocated successfully')
      }
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save allocation'), {
        duration: 5000,
      })
    }
  }

  const handleDelete = async () => {
    if (!allocation) return

    if (
      window.confirm(
        `Are you sure you want to cancel the allocation for ${allocation.vehicleDetails?.registration} and ${allocation.driverDetails?.name}?`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(allocation.id)
        toast.success('Allocation cancelled successfully')
        onClose()
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to cancel allocation'))
      }
    }
  }

  const isLoading = loadingDrivers || loadingVehicles
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Allocation Details' : 'Allocate Vehicle to Driver'}
      size="md"
      footer={
        <div className="flex w-full justify-between items-center gap-2">
          {isEditMode ? (
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Cancel Allocation
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="sm" className="mr-2" />
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Allocate'
              )}
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <Select
            label="Select Vehicle"
            placeholder="Select a vehicle..."
            value={vehicleId}
            options={vehicleOptions}
            onValueChange={setVehicleId}
            name="vehicle"
            className="w-full"
          />

          <Select
            label="Select Driver"
            placeholder="Select a driver..."
            value={driverId}
            options={driverOptions}
            onValueChange={setDriverId}
            name="driver"
            className="w-full"
          />

          <Input
            label="Allocation Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            leftIcon={<CalendarIcon size={16} />}
            required
          />

          {isEditMode && allocation && (
            <div className="mt-6 rounded-lg border border-border bg-bg-secondary p-4 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Current Scheduled Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Truck size={16} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted">Vehicle</p>
                    <p className="text-sm font-medium text-text">
                      {allocation.vehicleDetails?.registration ?? 'N/A'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {allocation.vehicleDetails?.type ?? 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User size={16} className="text-text-muted mt-0.5" />
                  <div>
                    <p className="text-xs text-text-muted">Driver</p>
                    <p className="text-sm font-medium text-text">
                      {allocation.driverDetails?.name ?? 'N/A'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {allocation.driverDetails?.phone ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  )
}
