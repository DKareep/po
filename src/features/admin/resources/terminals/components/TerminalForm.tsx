import type { FormEventHandler } from 'react'

import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'
import { LocationSelector } from '@/components/ui/LocationSelector'

import type { CreateTerminalInput } from '../schema/terminal.schema'

interface TerminalFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function TerminalForm({ id, onSubmit }: TerminalFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateTerminalInput>()

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Name"
        placeholder="JFK Airport Fuel Depot"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Address"
        placeholder="Airport Cargo Road, Queens"
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
