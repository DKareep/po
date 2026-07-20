import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteOrder } from '../hooks/useDeleteOrder'

import type { Order } from '../types'

interface Props {
  open: boolean
  order: Order | null
  onClose: () => void
}

export function DeleteOrderModal({ open, order, onClose }: Props) {
  const mutation = useDeleteOrder()

  if (!order) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Order"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(order.id, {
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
        Are you sure you want to delete order <strong>{order.id}</strong>?
      </p>
    </Modal>
  )
}
