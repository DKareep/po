import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  unit: z.string().trim().min(1, 'Unit is required'),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
