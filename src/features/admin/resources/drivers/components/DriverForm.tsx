import type { FormEventHandler } from 'react'

import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'

import type { CreateDriverInput } from '../schema/driver.schema'

interface DriverFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function DriverForm({ id, onSubmit }: DriverFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDriverInput>()

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      <Input
        label="Name"
        placeholder="John Smith"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="License"
        placeholder="DL-123456"
        error={errors.license?.message}
        {...register('license')}
      />

      <Input
        label="Phone"
        placeholder="+1-555-0100"
        error={errors.phone?.message}
        {...register('phone')}
      />
    </form>
  )
}
