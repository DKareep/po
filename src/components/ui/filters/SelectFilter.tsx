import { Select } from '@/components/ui/select'
import { useTableFilters } from '@/hooks/useTableFilters.ts'

interface Option {
  label: string
  value: string
}

interface SelectFilterProps {
  param: string
  label: string
  options: readonly Option[]
}

export function SelectFilter({ param, label, options }: SelectFilterProps) {
  const { get, set } = useTableFilters()

  return (
    <Select
      fullWidth={false}
      containerClassName="w-44"
      value={get(param) || ''}
      placeholder={label}
      options={[
        {
          label: 'All',
          value: '__all__',
        },
        ...options,
      ]}
      onValueChange={(value) => set(param, value === '__all__' ? '' : value)}
    />
  )
}
