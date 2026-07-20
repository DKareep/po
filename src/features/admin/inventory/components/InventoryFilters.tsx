import {
  SearchInput,
  SelectFilter,
  ResetFilters,
} from '@/components/ui/filters'

const TYPE_OPTIONS = [
  { label: 'Hubs', value: 'hub' },
  { label: 'Terminals', value: 'terminal' },
]

const STOCK_STATUS_OPTIONS = [
  { label: 'Healthy Stock', value: 'healthy' },
  { label: 'Warning Level', value: 'warning' },
  { label: 'Critical Level', value: 'critical' },
]

export function InventoryFilters() {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3 shadow-sm">
      <SearchInput param="search" placeholder="Search location..." />

      <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

      <SelectFilter param="type" label="Location Type" options={TYPE_OPTIONS} />

      <SelectFilter
        param="stockStatus"
        label="Stock Status"
        options={STOCK_STATUS_OPTIONS}
      />

      <div className="ml-auto">
        <ResetFilters />
      </div>
    </div>
  )
}
