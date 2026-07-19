import type { CSSProperties } from 'react'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpinnerColor = 'primary' | 'text' | 'muted' | 'inverse' | 'current'

interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  label?: string
  fullscreen?: boolean
  className?: string
}

const sizePx: Record<SpinnerSize, number> = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
  xl: 44,
}

const colorClass: Record<SpinnerColor, string> = {
  primary: 'text-primary',
  text: 'text-text',
  muted: 'text-text-muted',
  inverse: 'text-text-inverse',
  current: 'text-current',
}

const labelSize: Record<SpinnerSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm sm:text-base',
  lg: 'text-base',
  xl: 'text-base sm:text-lg',
}

export function Spinner({
  size = 'md',
  color = 'primary',
  label,
  fullscreen = false,
  className = '',
}: SpinnerProps) {
  const px = sizePx[size]
  const style: CSSProperties = { width: px, height: px }

  const svg = (
    <svg
      role="status"
      aria-hidden={label ? undefined : true}
      aria-label={label ?? 'Loading'}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={`animate-spin ${colorClass[color]}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )

  const content = (
    <div
      className={[
        'inline-flex items-center gap-2',
        label ? 'flex-col sm:flex-row' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {svg}
      {label && (
        <span className={`${labelSize[size]} text-text-secondary`}>
          {label}
        </span>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 backdrop-blur-sm p-4"
      >
        {content}
      </div>
    )
  }

  return content
}
