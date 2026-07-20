import { Check } from 'lucide-react'
import { forwardRef } from 'react'

import type { SelectOption as SelectOptionType } from './types'

interface Props {
  option: SelectOptionType
  selected: boolean
  focused: boolean
  onMouseEnter: () => void
  onClick: () => void
}

export const SelectOption = forwardRef<HTMLButtonElement, Props>(
  ({ option, selected, focused, onMouseEnter, onClick }, ref) => {
    return (
      <li role="presentation">
        <button
          ref={ref}
          type="button"
          role="option"
          aria-selected={selected}
          disabled={option.disabled}
          onMouseEnter={onMouseEnter}
          onClick={onClick}
          className={[
            'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
            focused && 'bg-primary-soft',
            selected ? 'font-medium text-primary' : 'text-text',
            option.disabled
              ? 'cursor-not-allowed opacity-40'
              : 'cursor-pointer hover:bg-bg-secondary',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {option.icon}

          <span className="flex-1 truncate">{option.label}</span>

          {selected && <Check size={16} className="text-primary" />}
        </button>
      </li>
    )
  },
)

SelectOption.displayName = 'SelectOption'
