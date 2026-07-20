import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteHub } from '../hooks/useDeleteHub'

import type { Hub } from '../types'

interface Props {
  open: boolean
  hub: Hub | null
  onClose: () => void
}

export function DeleteHubModal({ open, hub, onClose }: Props) {
  const mutation = useDeleteHub()

  if (!hub) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Hub"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(hub.id, {
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
        Are you sure you want to delete hub <strong>{hub.name}</strong>?
      </p>
    </Modal>
  )
}
