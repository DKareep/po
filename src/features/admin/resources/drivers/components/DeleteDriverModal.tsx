import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteDriver } from '../hooks/useDeleteDriver'

import type { Driver } from '../types'

interface Props {
  open: boolean
  driver: Driver | null
  onClose: () => void
}

export function DeleteDriverModal({ open, driver, onClose }: Props) {
  const mutation = useDeleteDriver()

  if (!driver) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Driver"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(driver.id, {
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
        Are you sure you want to delete driver <strong>{driver.name}</strong>?
      </p>
    </Modal>
  )
}
