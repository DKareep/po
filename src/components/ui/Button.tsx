import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md ' +
  'transition-colors duration-150 select-none whitespace-nowrap ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text-inverse hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-bg-secondary text-text hover:bg-bg-tertiary active:bg-bg-tertiary border border-border',
  outline:
    'bg-transparent text-text border border-border hover:bg-surface-hover active:bg-bg-secondary',
  ghost:
    'bg-transparent text-text hover:bg-surface-hover active:bg-bg-secondary',
  danger:
    'bg-danger text-text-inverse hover:bg-danger-hover active:bg-danger-hover',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-1.5 h-8 sm:h-9',
  md: 'text-sm sm:text-base px-4 py-2 h-10',
  lg: 'text-base sm:text-lg px-5 py-2.5 h-11 sm:h-12',
}

const spinnerSizeFor: Record<ButtonSize, 'xs' | 'sm' | 'md'> = {
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading

    const classes = [
      base,
      variants[variant],
      sizes[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? (
          <Spinner size={spinnerSizeFor[size]} color="inverse" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        {children && (
          <span className="inline-flex items-center">{children}</span>
        )}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  },
)
