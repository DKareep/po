import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { VehicleForm } from './VehicleForm'

import {
  createVehicleSchema,
  type CreateVehicleInput,
} from '../schema/vehicle.schema'

import { useCreateVehicle } from '../hooks/useCreateVehicle'

interface CreateVehicleModalProps {
  open: boolean
  onClose: () => void
}

const FORM_ID = 'create-vehicle-form'

export function CreateVehicleModal({ open, onClose }: CreateVehicleModalProps) {
  const mutation = useCreateVehicle()

  const form = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),

    defaultValues: {
      registration: '',
      capacity: undefined,
      type: '',
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
      title="Create Vehicle"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Vehicle
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <VehicleForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
