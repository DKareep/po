import type { FormEventHandler } from 'react'

import { Controller, useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/select'

import { VEHICLE_TYPE_OPTIONS } from '../constants'
import type { CreateVehicleInput } from '../schema/vehicle.schema'

interface VehicleFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function VehicleForm({ id, onSubmit }: VehicleFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateVehicleInput>()

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Registration"
        placeholder="KA01AB1234"
        error={errors.registration?.message}
        {...register('registration')}
      />

      <Input
        label="Capacity"
        type="number"
        placeholder="1000"
        error={errors.capacity?.message}
        {...register('capacity', {
          valueAsNumber: true,
        })}
      />

      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Select
            label="Vehicle Type"
            placeholder="Select vehicle type"
            options={VEHICLE_TYPE_OPTIONS}
            value={field.value}
            onValueChange={field.onChange}
            error={errors.type?.message}
          />
        )}
      />
    </form>
  )
}
