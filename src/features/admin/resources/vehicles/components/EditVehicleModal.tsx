import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { VehicleForm } from './VehicleForm'

import {
  createVehicleSchema,
  type CreateVehicleInput,
} from '../schema/vehicle.schema'

import { useUpdateVehicle } from '../hooks/useUpdateVehicle'

import type { Vehicle } from '../types'

interface EditVehicleModalProps {
  open: boolean
  vehicle: Vehicle | null
  onClose: () => void
}

const FORM_ID = 'edit-vehicle-form'

export function EditVehicleModal({
  open,
  vehicle,
  onClose,
}: EditVehicleModalProps) {
  const mutation = useUpdateVehicle()

  const form = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),

    defaultValues: {
      registration: '',
      capacity: undefined,
      type: '',
    },

    values: vehicle
      ? {
          registration: vehicle.registration,
          capacity: vehicle.capacity,
          type: vehicle.type,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!vehicle) return

    mutation.mutate(
      {
        id: vehicle.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!vehicle) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Vehicle"
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
        <VehicleForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
