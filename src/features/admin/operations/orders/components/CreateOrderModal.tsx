import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { OrderForm, type DestinationItem, type DriverItem } from './OrderForm'
import {
  createOrderSchema,
  type CreateOrderInput,
} from '../schema/order.schema'
import { useCreateOrder } from '../hooks/useCreateOrder'

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  destinations: DestinationItem[]
  drivers: DriverItem[]
}

const FORM_ID = 'create-order-form'

export function CreateOrderModal({
  open,
  onClose,
  destinations,
  drivers,
}: CreateOrderModalProps) {
  const mutation = useCreateOrder()

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      destinationId: '',
      product: '',
      quantity: undefined as unknown as number,
      deliveryDate: new Date().toISOString().split('T')[0],
      assignedDriverId: null,
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
      title="Create Order"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Order
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <OrderForm
          id={FORM_ID}
          onSubmit={handleSubmit}
          destinations={destinations}
          drivers={drivers}
        />
      </FormProvider>
    </Modal>
  )
}
