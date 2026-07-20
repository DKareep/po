import { SelectFilter, ResetFilters } from '@/components/ui/filters'

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
]

export function OrderFilters() {
  return (
    <div className="mb-6 flex flex-nowrap items-center gap-3 rounded-lg border border-border px-4 py-3 shadow-sm">
      <SelectFilter param="status" label="Status" options={STATUS_OPTIONS} />

      <div className="ml-auto">
        <ResetFilters />
      </div>
    </div>
  )
}
