import { z } from 'zod'

export const createDriverSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  license: z.string().trim().min(1, 'License number is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
