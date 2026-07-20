import { z } from 'zod'

export const createVehicleSchema = z.object({
  registration: z.string().trim().min(1, 'Registration is required'),

  capacity: z
    .number({
      error: 'Capacity is required',
    })
    .positive('Capacity must be greater than 0'),

  type: z.string().min(1, 'Vehicle type is required'),
})

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
