import { type ReactNode } from 'react'

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  icon?: ReactNode
}

export interface SelectProps {
  label?: string

  value?: string

  placeholder?: string

  options: readonly SelectOption[]

  onValueChange?: (value: string) => void

  disabled?: boolean

  invalid?: boolean

  error?: string

  helperText?: string

  className?: string

  containerClassName?: string

  maxHeight?: number

  fullWidth?: boolean

  name?: string
}
