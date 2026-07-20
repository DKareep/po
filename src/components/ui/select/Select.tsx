import { ChevronDown } from 'lucide-react'
import {
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import { SelectOption } from './SelectOption'
import type { SelectProps } from './types'
import { useClickOutside } from './useClickOutside'

interface DropdownPosition {
  top: number
  left: number
  width: number
  placement: 'below' | 'above'
}

export function Select({
  label,
  value,
  options,
  placeholder = 'Select',
  disabled = false,
  invalid = false,
  error,
  helperText,
  className,
  containerClassName,
  maxHeight = 280,
  fullWidth = true,
  name,
  onValueChange,
}: SelectProps) {
  const id = useId()
  const listboxId = `${id}-listbox`
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [position, setPosition] = useState<DropdownPosition | null>(null)

  const hasError = Boolean(error) || invalid
  const describedBy = error ? errorId : helperText ? helperId : undefined

  const closeMenu = () => {
    setOpen(false)
    setFocusedIndex(-1)
  }

  const openMenu = () => {
    const selectedIndex = options.findIndex((option) => option.value === value)
    const initial =
      selectedIndex >= 0
        ? selectedIndex
        : options.findIndex((option) => !option.disabled)

    setOpen(true)
    setFocusedIndex(initial)
  }

  useClickOutside(rootRef, closeMenu, { extraRef: listboxRef })

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  useEffect(() => {
    if (!open) return

    optionRefs.current[focusedIndex]?.scrollIntoView({
      block: 'nearest',
    })
  }, [focusedIndex, open])

  useLayoutEffect(() => {
    if (!open) return

    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()

      if (!rect) return

      const gap = 8
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      const placeAbove = spaceBelow < maxHeight + gap && spaceAbove > spaceBelow

      setPosition({
        top: placeAbove ? rect.top - gap : rect.bottom + gap,
        left: rect.left,
        width: rect.width,
        placement: placeAbove ? 'above' : 'below',
      })
    }

    update()

    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, maxHeight])

  const selectOption = (index: number) => {
    const option = options[index]

    if (!option || option.disabled) return

    onValueChange?.(option.value)
    closeMenu()
  }

  const move = (direction: 1 | -1) => {
    if (!options.length) return

    let next = focusedIndex

    do {
      next += direction

      if (next < 0) next = options.length - 1
      if (next >= options.length) next = 0
    } while (options[next]?.disabled)

    setFocusedIndex(next)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()

        if (!open) {
          openMenu()
          return
        }

        move(1)
        break

      case 'ArrowUp':
        event.preventDefault()

        if (!open) {
          openMenu()
          return
        }

        move(-1)
        break

      case 'Home':
        event.preventDefault()
        setFocusedIndex(options.findIndex((o) => !o.disabled))
        break

      case 'End':
        event.preventDefault()

        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setFocusedIndex(i)
            break
          }
        }

        break

      case 'Enter':
      case ' ':
        event.preventDefault()

        if (!open) {
          openMenu()
          return
        }

        selectOption(focusedIndex)
        break

      case 'Escape':
        event.preventDefault()
        closeMenu()
        break

      case 'Tab':
        closeMenu()
        break

      default:
        if (event.key.length === 1) {
          const key = event.key.toLowerCase()

          const match = options.findIndex(
            (option) =>
              !option.disabled && option.label.toLowerCase().startsWith(key),
          )

          if (match >= 0) {
            if (!open) setOpen(true)
            setFocusedIndex(match)
          }
        }
    }
  }

  const dropdown =
    open && position ? (
      <div
        ref={listboxRef}
        id={listboxId}
        role="listbox"
        aria-labelledby={label ? `${id}-label` : undefined}
        style={{
          position: 'fixed',
          top: position.placement === 'below' ? position.top : undefined,
          bottom:
            position.placement === 'above'
              ? window.innerHeight - position.top
              : undefined,
          left: position.left,
          width: position.width,
          maxHeight,
        }}
        className="z-[60] overflow-auto rounded-lg border border-border bg-surface py-1 shadow-xl"
      >
        {options.map((option, index) => (
          <SelectOption
            key={option.value}
            ref={(el) => {
              optionRefs.current[index] = el
            }}
            option={option}
            selected={option.value === value}
            focused={focusedIndex === index}
            onMouseEnter={() => setFocusedIndex(index)}
            onClick={() => selectOption(index)}
          />
        ))}

        {options.length === 0 && (
          <div className="px-3 py-2 text-sm text-text-muted">No options</div>
        )}
      </div>
    ) : null

  return (
    <div
      ref={rootRef}
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
          id={`${id}-label`}
          htmlFor={`${id}-trigger`}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={`${id}-trigger`}
        type="button"
        name={name}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className={[
          'flex h-11 w-full items-center justify-between rounded-lg border',
          'bg-surface px-3 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          hasError
            ? 'border-danger'
            : 'border-border hover:border-border-strong',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={selectedOption ? 'text-text' : 'text-text-muted'}>
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          size={18}
          className={`text-text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}

      {dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}
