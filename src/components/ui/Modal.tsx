import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  closeOnBackdrop?: boolean
  closeOnEsc?: boolean
  showCloseButton?: boolean
  initialFocusRef?: React.RefObject<HTMLElement | null>
  className?: string
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg sm:max-w-xl',
  xl: 'max-w-xl sm:max-w-2xl md:max-w-3xl',
  full: 'max-w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-3rem)]',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  initialFocusRef,
  className = '',
}: ModalProps) {
  const titleId = useId()
  const descId = useId()
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const target = initialFocusRef?.current ?? dialogRef.current
    target?.focus()

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, closeOnEsc, onClose, initialFocusRef])

  if (!open) return null

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Close modal"
        tabIndex={-1}
        onClick={() => {
          if (closeOnBackdrop) onClose()
        }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={[
          'relative w-full',
          sizeMap[size],
          'bg-surface text-text',
          'rounded-t-xl sm:rounded-xl shadow-xl',
          'border border-border',
          'max-h-[92vh] sm:max-h-[85vh]',
          'flex flex-col',
          'outline-none',
          'animate-[fadeIn_150ms_ease-out]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border-light">
            <div className="min-w-0 flex-1">
              {title && (
                <h2
                  id={titleId}
                  className="text-lg sm:text-xl font-semibold text-text truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1 text-sm text-text-secondary">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 -mr-1 rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-3 border-t border-border-light bg-bg-secondary rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(dialog, document.body)
}
