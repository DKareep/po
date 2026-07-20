import type { FormEventHandler } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/select'

import { getHaversineDistance, DOWNTOWN_HUB_COORDS } from '../utils/distance'
import type { CreateOrderInput } from '../schema/order.schema'

export interface DestinationItem {
  id: string
  name: string
  type: 'hub' | 'terminal'
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface DriverItem {
  id: string
  name: string
}

interface OrderFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
  destinations: DestinationItem[]
  drivers: DriverItem[]
}

const PRODUCT_OPTIONS = [
  { label: 'Diesel', value: 'diesel' },
  { label: 'Petrol', value: 'petrol' },
  { label: 'Jet A-1 Aviation Fuel', value: 'jet_a1' },
]

export function OrderForm({
  id,
  onSubmit,
  destinations,
  drivers,
}: OrderFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateOrderInput>()

  // Map destinations with type indicators and distance from Downtown Hub
  const destinationOptions = destinations.map((d) => {
    let label = `${d.name} (${d.type === 'hub' ? 'Hub' : 'Terminal'})`
    if (d.coordinates) {
      const dist = getHaversineDistance(
        DOWNTOWN_HUB_COORDS.lat,
        DOWNTOWN_HUB_COORDS.lng,
        d.coordinates.lat,
        d.coordinates.lng,
      )
      label += ` - ${dist.toFixed(1)} km`
    }
    return { label, value: d.id }
  })

  const driverOptions = [
    { label: 'Unassigned', value: '' },
    ...drivers.map((d) => ({ label: d.name, value: d.id })),
  ]

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Controller
        control={control}
        name="destinationId"
        render={({ field }) => (
          <Select
            label="Destination"
            placeholder="Select destination hub/terminal"
            options={destinationOptions}
            value={field.value}
            onValueChange={field.onChange}
            error={errors.destinationId?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="product"
        render={({ field }) => (
          <Select
            label="Product"
            placeholder="Select product"
            options={PRODUCT_OPTIONS}
            value={field.value}
            onValueChange={field.onChange}
            error={errors.product?.message}
          />
        )}
      />

      <Input
        label="Quantity (L)"
        type="number"
        placeholder="e.g. 5000"
        error={errors.quantity?.message}
        {...register('quantity', {
          valueAsNumber: true,
        })}
      />

      <Input
        label="Delivery Date"
        type="date"
        error={errors.deliveryDate?.message}
        {...register('deliveryDate')}
      />

      <Controller
        control={control}
        name="assignedDriverId"
        render={({ field }) => (
          <Select
            label="Assigned Driver"
            placeholder="Select driver (optional)"
            options={driverOptions}
            value={field.value || ''}
            onValueChange={(val) => field.onChange(val === '' ? null : val)}
            error={errors.assignedDriverId?.message}
          />
        )}
      />
    </form>
  )
}
