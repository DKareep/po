import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'

interface DragConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  driverName?: string
  vehicleReg?: string
  oldDate: string
  newDate: string
}

export function DragConfirmModal({
  open,
  onClose,
  onConfirm,
  driverName = 'Unknown Driver',
  vehicleReg = 'Unknown Vehicle',
  oldDate,
  newDate,
}: DragConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Allocation Move"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirm Move
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-text">
          Are you sure you want to reschedule the vehicle allocation?
        </p>

        <div className="rounded-lg border border-border bg-bg-secondary p-4 space-y-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Allocation
            </span>
            <p className="text-sm font-medium text-text">
              {vehicleReg} &rarr; {driverName}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-light">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Original Date
              </span>
              <p className="text-sm font-medium text-text">{oldDate}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted animate-pulse">
                New Date
              </span>
              <p className="text-sm font-medium text-primary">{newDate}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Note: This will perform check for double-booking conflicts. If a
          driver or vehicle is already scheduled on the new date, this
          reschedule request will be rejected.
        </p>
      </div>
    </Modal>
  )
}
