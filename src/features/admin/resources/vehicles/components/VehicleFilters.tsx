import {
  SearchInput,
  SelectFilter,
  ResetFilters,
} from '@/components/ui/filters'

import { VEHICLE_TYPE_OPTIONS } from '../constants'

export function VehicleFilters() {
  return (
    <div className="mb-6 flex flex-nowrap items-center gap-3 rounded-lg border border-border  px-4 py-3 shadow-sm">
      <SearchInput param="search" placeholder="Search registration" />

      <div className="h-8 w-px shrink-0 bg-border" aria-hidden="true" />

      <SelectFilter
        param="type"
        label="Vehicle Type"
        options={VEHICLE_TYPE_OPTIONS}
      />

      {/*<SelectFilter*/}
      {/*  param="status"*/}
      {/*  label="Status"*/}
      {/*  options={VEHICLE_STATUS_OPTIONS}*/}
      {/*/>*/}

      <div className="ml-auto">
        <ResetFilters />
      </div>
    </div>
  )
}
