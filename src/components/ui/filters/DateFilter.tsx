import { Input } from '@/components/ui/Input.tsx'
import { useTableFilters } from '@/hooks/useTableFilters.ts'

interface DateFilterProps {
  param: string
}

export function DateFilter({ param }: DateFilterProps) {
  const { get, set } = useTableFilters()

  return (
    <Input
      type="date"
      value={get(param)}
      onChange={(e) => set(param, e.target.value)}
    />
  )
}
