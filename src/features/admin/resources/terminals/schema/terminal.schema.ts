import { z } from 'zod'

export const createTerminalSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  address: z.string().trim().min(1, 'Address is required'),
  lat: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({
      message: 'Latitude must be a number',
    }),
  ),
  lng: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({
      message: 'Longitude must be a number',
    }),
  ),
})

export type CreateTerminalInput = z.infer<typeof createTerminalSchema>
