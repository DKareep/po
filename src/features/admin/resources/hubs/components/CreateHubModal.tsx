import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { HubForm } from './HubForm'

import { createHubSchema, type CreateHubInput } from '../schema/hub.schema'

import { useCreateHub } from '../hooks/useCreateHub'

interface CreateHubModalProps {
  open: boolean
  onClose: () => void
}

const FORM_ID = 'create-hub-form'

export function CreateHubModal({ open, onClose }: CreateHubModalProps) {
  const mutation = useCreateHub()

  const form = useForm<CreateHubInput>({
    resolver: zodResolver(
      createHubSchema,
    ) as unknown as Resolver<CreateHubInput>,

    defaultValues: {
      name: '',
      address: '',
      lat: undefined as unknown as number,
      lng: undefined as unknown as number,
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
      title="Create Hub"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Hub
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <HubForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
