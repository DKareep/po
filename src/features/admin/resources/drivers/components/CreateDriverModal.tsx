import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { DriverForm } from './DriverForm'

import {
  createDriverSchema,
  type CreateDriverInput,
} from '../schema/driver.schema'

import { useCreateDriver } from '../hooks/useCreateDriver'

interface CreateDriverModalProps {
  open: boolean
  onClose: () => void
}

const FORM_ID = 'create-driver-form'

export function CreateDriverModal({ open, onClose }: CreateDriverModalProps) {
  const mutation = useCreateDriver()

  const form = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),

    defaultValues: {
      name: '',
      license: '',
      phone: '',
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
      title="Create Driver"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Driver
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
