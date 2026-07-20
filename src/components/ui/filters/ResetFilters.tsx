import { Button } from '@/components/ui/Button.tsx'
import { useTableFilters } from '@/hooks/useTableFilters.ts'

export function ResetFilters() {
  const { reset } = useTableFilters()

  return (
    <Button variant="outline" onClick={reset}>
      Reset
    </Button>
  )
}
