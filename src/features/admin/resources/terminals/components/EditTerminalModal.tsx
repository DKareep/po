import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { TerminalForm } from './TerminalForm'

import {
  createTerminalSchema,
  type CreateTerminalInput,
} from '../schema/terminal.schema'

import { useUpdateTerminal } from '../hooks/useUpdateTerminal'

import type { Terminal } from '../types'

interface EditTerminalModalProps {
  open: boolean
  terminal: Terminal | null
  onClose: () => void
}

const FORM_ID = 'edit-terminal-form'

export function EditTerminalModal({
  open,
  terminal,
  onClose,
}: EditTerminalModalProps) {
  const mutation = useUpdateTerminal()

  const form = useForm<CreateTerminalInput>({
    resolver: zodResolver(
      createTerminalSchema,
    ) as unknown as Resolver<CreateTerminalInput>,

    defaultValues: {
      name: '',
      address: '',
      lat: undefined as unknown as number,
      lng: undefined as unknown as number,
    },

    values: terminal
      ? {
          name: terminal.name,
          address: terminal.address,
          lat: terminal.coordinates?.lat ?? 0,
          lng: terminal.coordinates?.lng ?? 0,
        }
      : undefined,
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!terminal) return

    mutation.mutate(
      {
        id: terminal.id,
        ...values,
      },
      {
        onSuccess: () => {
          handleClose()
        },
      },
    )
  })

  if (!terminal) return null

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Terminal"
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
        <TerminalForm id={FORM_ID} onSubmit={handleSubmit} />
      </FormProvider>
    </Modal>
  )
}
