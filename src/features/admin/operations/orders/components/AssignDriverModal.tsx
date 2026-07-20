import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/select'

import { useUpdateOrder } from '../hooks/useUpdateOrder'
import type { Order } from '../types'

interface DriverItem {
  id: string
  name: string
}

interface AssignDriverModalProps {
  open: boolean
  order: Order | null
  drivers: DriverItem[]
  onClose: () => void
}

export function AssignDriverModal({
  open,
  order,
  drivers,
  onClose,
}: AssignDriverModalProps) {
  const mutation = useUpdateOrder()
  const [selectedDriverId, setSelectedDriverId] = useState<string>(
    order?.assignedDriverId || '',
  )

  if (!order) return null

  const driverOptions = [
    { label: 'Unassigned', value: '' },
    ...drivers.map((d) => ({ label: d.name, value: d.id })),
  ]

  const handleAssign = () => {
    mutation.mutate(
      {
        id: order.id,
        assignedDriverId: selectedDriverId === '' ? null : selectedDriverId,
      },
      {
        onSuccess: onClose,
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Driver to Order ${order.id}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button loading={mutation.isPending} onClick={handleAssign}>
            Assign
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-text-secondary">
          Select a driver to handle delivery for this order. Assigning a driver
          will automatically transition the order state.
        </p>

        <Select
          label="Driver"
          placeholder="Select a driver..."
          options={driverOptions}
          value={selectedDriverId}
          onValueChange={setSelectedDriverId}
        />
      </div>
    </Modal>
  )
}
