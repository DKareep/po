import type { FormEventHandler } from 'react'

import { useFormContext } from 'react-hook-form'

import { Input } from '@/components/ui/Input'

import type { CreateProductInput } from '../schema/product.schema'

interface ProductFormProps {
  id: string
  onSubmit: FormEventHandler<HTMLFormElement>
  isEdit?: boolean
}

export function ProductForm({ id, onSubmit, isEdit }: ProductFormProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateProductInput & { id?: string }>()

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-5">
      {!isEdit && (
        <Input
          label="ID"
          placeholder="diesel"
          error={errors.id?.message}
          {...register('id')}
        />
      )}

      <Input
        label="Name"
        placeholder="Diesel"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Unit"
        placeholder="Liters"
        error={errors.unit?.message}
        {...register('unit')}
      />
    </form>
  )
}
