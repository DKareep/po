import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { useDeleteTerminal } from '../hooks/useDeleteTerminal'

import type { Terminal } from '../types'

interface Props {
  open: boolean
  terminal: Terminal | null
  onClose: () => void
}

export function DeleteTerminalModal({ open, terminal, onClose }: Props) {
  const mutation = useDeleteTerminal()

  if (!terminal) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Terminal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={mutation.isPending}
            onClick={() =>
              mutation.mutate(terminal.id, {
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
        Are you sure you want to delete terminal{' '}
        <strong>{terminal.name}</strong>?
      </p>
    </Modal>
  )
}
