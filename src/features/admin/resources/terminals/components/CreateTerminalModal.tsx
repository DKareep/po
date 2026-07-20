import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

import { TerminalForm } from './TerminalForm'

import {
  createTerminalSchema,
  type CreateTerminalInput,
} from '../schema/terminal.schema'

import { useCreateTerminal } from '../hooks/useCreateTerminal'

interface CreateTerminalModalProps {
  open: boolean
  onClose: () => void
}

const FORM_ID = 'create-terminal-form'

export function CreateTerminalModal({
  open,
  onClose,
}: CreateTerminalModalProps) {
  const mutation = useCreateTerminal()

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
      title="Create Terminal"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Create Terminal
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
