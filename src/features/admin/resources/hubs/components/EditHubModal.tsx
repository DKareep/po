import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { HubForm } from './HubForm'

import { createHubSchema, type CreateHubInput } from '../schema/hub.schema'

import { useUpdateHub } from '../hooks/useUpdateHub'

import type { Hub } from '../types'

interface EditHubModalProps {
  open: boolean
  hub: Hub | null
  onClose: () => void
}

const FORM_ID = 'edit-hub-form'

export function EditHubModal({ open, hub, onClose }: EditHubModalProps) {
  const mutation = useUpdateHub()

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

    values: hub
      ? {
          name: hub.name,
          address: hub.address,
          lat: hub.coordinates?.lat ?? 0,
          lng: hub.coordinates?.lng ?? 0,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!hub) return

    mutation.mutate(
      {
        id: hub.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!hub) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Hub"
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
        <HubForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
