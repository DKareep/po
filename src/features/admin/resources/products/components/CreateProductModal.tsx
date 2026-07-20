import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { ProductForm } from './ProductForm'

import {
  createProductSchema,
  type CreateProductInput,
} from '../schema/product.schema'

import { useCreateProduct } from '../hooks/useCreateProduct'

interface CreateProductModalProps {
  open: boolean
  onClose: () => void
}

const FORM_ID = 'create-product-form'

export function CreateProductModal({ open, onClose }: CreateProductModalProps) {
  const mutation = useCreateProduct()

  const form = useForm<CreateProductInput & { id?: string }>({
    resolver: zodResolver(createProductSchema),

    defaultValues: {
      id: '',
      name: '',
      unit: 'Liters',
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        form.reset()
        onClose()
      },
    })
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Product"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Product
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <ProductForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
