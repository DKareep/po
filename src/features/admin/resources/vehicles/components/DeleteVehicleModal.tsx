import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteVehicle } from '../hooks/useDeleteVehicle'

import type { Vehicle } from '../types'

interface Props {
  open: boolean
  vehicle: Vehicle | null
  onClose: () => void
}

export function DeleteVehicleModal({ open, vehicle, onClose }: Props) {
  const mutation = useDeleteVehicle()

  if (!vehicle) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Vehicle"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(vehicle.id, {
                onSuccess: onClose,
              })
            }
          >
            Delete
          </Button>
        </>
      }
    >
      <p>
        Are you sure you want to delete <strong>{vehicle.registration}</strong>?
      </p>
    </Modal>
  )
}
