import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { DriverForm } from './DriverForm'

import {
  createDriverSchema,
  type CreateDriverInput,
} from '../schema/driver.schema'

import { useUpdateDriver } from '../hooks/useUpdateDriver'

import type { Driver } from '../types'

interface EditDriverModalProps {
  open: boolean
  driver: Driver | null
  onClose: () => void
}

const FORM_ID = 'edit-driver-form'

export function EditDriverModal({
  open,
  driver,
  onClose,
}: EditDriverModalProps) {
  const mutation = useUpdateDriver()

  const form = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),

    defaultValues: {
      name: '',
      license: '',
      phone: '',
    },

    values: driver
      ? {
          name: driver.name,
          license: driver.license,
          phone: driver.phone,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!driver) return

    mutation.mutate(
      {
        id: driver.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!driver) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Driver"
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
        <DriverForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
