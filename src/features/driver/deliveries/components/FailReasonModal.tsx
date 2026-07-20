import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

interface FailReasonModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  isSubmitting: boolean
  orderId: string
}

export function FailReasonModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  orderId,
}: FailReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      setError('A failure reason is required.')
      return
    }
    onSubmit(reason.trim())
  }

  const footer = (
    <>
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        variant="danger"
        type="submit"
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || !reason.trim()}
      >
        Confirm Failure
      </Button>
    </>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle size={22} />
          <span>Mark Delivery as Failed</span>
        </div>
      }
      description={`Provide a failure reason for Order #${orderId.replace('order-', '')}`}
      footer={footer}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="fail-reason"
            className="block text-sm font-semibold text-text-secondary mb-1.5"
          >
            Reason for Failure
          </label>
          <textarea
            id="fail-reason"
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (e.target.value.trim()) setError('')
            }}
            placeholder="e.g., Target hub terminal gate is locked / Customer refilled via another supplier / Access road blocked by construction"
            className="w-full rounded-lg border border-border bg-bg-secondary p-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            disabled={isSubmitting}
            autoFocus
          />
          {error && (
            <p className="mt-1 text-xs font-medium text-danger">{error}</p>
          )}
        </div>
      </form>
    </Modal>
  )
}
