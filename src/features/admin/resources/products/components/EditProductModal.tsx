import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { ProductForm } from './ProductForm'

import {
  createProductSchema,
  type CreateProductInput,
} from '../schema/product.schema'

import { useUpdateProduct } from '../hooks/useUpdateProduct'

import type { Product } from '../types'

interface EditProductModalProps {
  open: boolean
  product: Product | null
  onClose: () => void
}

const FORM_ID = 'edit-product-form'

export function EditProductModal({
  open,
  product,
  onClose,
}: EditProductModalProps) {
  const mutation = useUpdateProduct()

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),

    defaultValues: {
      name: '',
      unit: '',
    },

    values: product
      ? {
          name: product.name,
          unit: product.unit,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!product) return

    mutation.mutate(
      {
        id: product.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!product) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Product"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <ProductForm id={FORM_ID} onSubmit={handleSubmit} isEdit />
      </FormProvider>
    </Modal>
  )
}
