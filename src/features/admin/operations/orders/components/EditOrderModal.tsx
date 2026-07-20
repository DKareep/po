import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { OrderForm, type DestinationItem, type DriverItem } from './OrderForm'
import {
  createOrderSchema,
  type CreateOrderInput,
} from '../schema/order.schema'
import { useUpdateOrder } from '../hooks/useUpdateOrder'
import type { Order } from '../types'

interface EditOrderModalProps {
  open: boolean
  order: Order | null
  onClose: () => void
  destinations: DestinationItem[]
  drivers: DriverItem[]
}

const FORM_ID = 'edit-order-form'

export function EditOrderModal({
  open,
  order,
  onClose,
  destinations,
  drivers,
}: EditOrderModalProps) {
  const mutation = useUpdateOrder()

  const form = useForm<CreateOrderInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      destinationId: '',
      product: '',
      quantity: undefined as unknown as number,
      deliveryDate: '',
      assignedDriverId: null,
    },
    values: order
      ? {
          destinationId: order.destinationId,
          product: order.product,
          quantity: order.quantity,
          deliveryDate: order.deliveryDate,
          assignedDriverId: order.assignedDriverId,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!order) return

    mutation.mutate(
      {
        id: order.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!order) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Order"
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
