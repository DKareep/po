import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteProduct } from '../hooks/useDeleteProduct'

import type { Product } from '../types'

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
}

export function DeleteProductModal({ open, product, onClose }: Props) {
  const mutation = useDeleteProduct()

  if (!product) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Product"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(product.id, {
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
        Are you sure you want to delete product <strong>{product.name}</strong>?
      </p>
    </Modal>
  )
}
