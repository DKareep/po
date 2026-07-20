import type { FormEventHandler } from 'react'

import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'
import { LocationSelector } from '@/components/ui/LocationSelector'

import type { CreateHubInput } from '../schema/hub.schema'

interface HubFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function HubForm({ id, onSubmit }: HubFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateHubInput>()

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Name"
        placeholder="Downtown Distribution Hub"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Address"
        placeholder="123 Main St, City Center"
        error={errors.address?.message}
        {...register('address')}
      />

      <LocationSelector />

      {(errors.lat || errors.lng) && (
        <p className="text-xs font-medium text-red-500">
          {errors.lat?.message || errors.lng?.message}
        </p>
      )}
    </form>
  )
}
