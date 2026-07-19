import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputSize?: InputSize
  fullWidth?: boolean
  containerClassName?: string
}

const sizeField: Record<InputSize, string> = {
  sm: 'h-8 sm:h-9 text-sm px-2.5',
  md: 'h-10 text-sm sm:text-base px-3',
  lg: 'h-11 sm:h-12 text-base sm:text-lg px-3.5',
}

const sizeIconPad: Record<InputSize, { left: string; right: string }> = {
  sm: { left: 'pl-8', right: 'pr-8' },
  md: { left: 'pl-10', right: 'pr-10' },
  lg: { left: 'pl-11', right: 'pr-11' },
}

const iconWrap: Record<InputSize, string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-11',
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    inputSize = 'md',
    fullWidth = true,
    id,
    disabled,
    className = '',
    containerClassName = '',
    ...rest
  },
  ref,
) {
  const reactId = useId()
  const inputId = id ?? reactId
  const describedById = error
    ? `${inputId}-error`
    : helperText
      ? `${inputId}-helper`
      : undefined

  const fieldClasses = [
    'block rounded-md bg-surface text-text placeholder:text-text-muted',
    'border transition-colors duration-150',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    error
      ? 'border-danger focus-visible:ring-danger'
      : 'border-border hover:border-border-strong focus-visible:ring-primary focus-visible:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-bg-secondary',
    sizeField[inputSize],
    leftIcon ? sizeIconPad[inputSize].left : '',
    rightIcon ? sizeIconPad[inputSize].right : '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={[
        fullWidth ? 'w-full' : 'inline-block',
        'flex flex-col gap-1.5',
        containerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span
            className={`pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center text-text-muted ${iconWrap[inputSize]}`}
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={fieldClasses}
          {...rest}
        />

        {rightIcon && (
          <span
            className={`pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center text-text-muted ${iconWrap[inputSize]}`}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})
