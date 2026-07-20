import { z } from 'zod'

export const createOrderSchema = z.object({
  destinationId: z.string().min(1, 'Destination is required'),
  product: z.string().min(1, 'Product is required'),
  quantity: z
    .number({
      error: 'Quantity is required',
    })
    .positive('Quantity must be greater than 0'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  assignedDriverId: z.string().nullable().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
