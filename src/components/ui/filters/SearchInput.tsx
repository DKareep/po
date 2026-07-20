import { useEffect, useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'
import { useTableFilters } from '@/hooks/useTableFilters'

interface SearchInputProps {
  param: string
  placeholder?: string
}

export function SearchInput({
  param,
  placeholder = 'Search...',
}: SearchInputProps) {
  const filters = useTableFilters()
  const externalValue = filters.get(param)

  const [value, setValue] = useState(externalValue)
  const [lastExternalValue, setLastExternalValue] = useState(externalValue)

  if (externalValue !== lastExternalValue) {
    setLastExternalValue(externalValue)
    setValue(externalValue)
  }

  const debouncedValue = useDebounce(value, 400)

  useEffect(() => {
    filters.set(param, debouncedValue)
  }, [debouncedValue])

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="h-11 w-72 rounded-lg border border-border bg-surface px-3"
    />
  )
}
