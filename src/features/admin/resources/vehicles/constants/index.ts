import { VehicleType } from '../types'

export const VEHICLE_TYPE_OPTIONS = [
  { label: 'Light Tanker', value: VehicleType.LIGHT_TANKER },
  { label: 'Tanker', value: VehicleType.TANKER },
  { label: 'Heavy Tanker', value: VehicleType.HEAVY_TANKER },
  { label: 'Semi-Tanker', value: VehicleType.SEMI_TANKER },
  { label: 'Double Tanker', value: VehicleType.DOUBLE_TANKER },
  { label: 'Super Tanker', value: VehicleType.SUPER_TANKER },
] as const

// export const VEHICLE_STATUS_OPTIONS = [
//   {
//     label: 'Available',
//     value: VehicleStatus.AVAILABLE,
//   },
//   {
//     label: 'Allocated',
//     value: VehicleStatus.ALLOCATED,
//   },
//   {
//     label: 'In Transit',
//     value: VehicleStatus.IN_TRANSIT,
//   },
//   {
//     label: 'Maintenance',
//     value: VehicleStatus.MAINTENANCE,
//   },
//   {
//     label: 'Out of Service',
//     value: VehicleStatus.OUT_OF_SERVICE,
//   },
// ] as const
