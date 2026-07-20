import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'

import { useUpdateLocationInventory } from '../hooks/useUpdateLocationInventory'
import type { LocationInventory } from '../types'

interface AdjustInventoryModalProps {
  open: boolean
  location: LocationInventory | null
  onClose: () => void
}

const adjustSchema = z.object({
  diesel: z
    .number({ message: 'Diesel volume is required' })
    .min(0, 'Volume cannot be negative'),
  petrol: z
    .number({ message: 'Petrol volume is required' })
    .min(0, 'Volume cannot be negative'),
  jet_a1: z
    .number({ message: 'Jet A-1 volume is required' })
    .min(0, 'Volume cannot be negative'),
})

type AdjustFormValues = z.infer<typeof adjustSchema>
const FORM_ID = 'adjust-inventory-form'

export function AdjustInventoryModal({
  open,
  location,
  onClose,
}: AdjustInventoryModalProps) {
  const mutation = useUpdateLocationInventory()

  const form = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      diesel: 0,
      petrol: 0,
      jet_a1: 0,
    },
  })

  useEffect(() => {
    if (location) {
      form.reset({
        diesel: location.inventory.diesel || 0,
        petrol: location.inventory.petrol || 0,
        jet_a1: location.inventory.jet_a1 || 0,
      })
    }
  }, [location, form])

  if (!location) return null

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        id: location.id,
        type: location.type,
        name: location.name,
        address: location.address,
        lat: location.coordinates?.lat,
        lng: location.coordinates?.lng,
        inventory: values,
      },
      {
        onSuccess: handleClose,
      },
    )
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Adjust Inventory - ${location.name}`}
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
        <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4 py-2">
          <Input
            label="Diesel Stock (L)"
            type="number"
            placeholder="0"
            error={form.formState.errors.diesel?.message}
            {...form.register('diesel', { valueAsNumber: true })}
          />

          <Input
            label="Petrol Stock (L)"
            type="number"
            placeholder="0"
            error={form.formState.errors.petrol?.message}
            {...form.register('petrol', { valueAsNumber: true })}
          />

          <Input
            label="Jet A-1 Stock (L)"
            type="number"
            placeholder="0"
            error={form.formState.errors.jet_a1?.message}
            {...form.register('jet_a1', { valueAsNumber: true })}
          />
        </form>
      </FormProvider>
    </Modal>
  )
}
