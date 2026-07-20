import { SearchInput, ResetFilters } from '@/components/ui/filters'

export function ProductFilters() {
  return (
    <div className="mb-6 flex flex-nowrap items-center gap-3 rounded-lg border border-border  px-4 py-3 shadow-sm">
      <SearchInput param="search" placeholder="Search ID, name" />

      <div className="ml-auto">
        <ResetFilters />
      </div>
    </div>
  )
}
