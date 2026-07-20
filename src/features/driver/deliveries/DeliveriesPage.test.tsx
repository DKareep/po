import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import DeliveriesPage from './DeliveriesPage'
import type { TodaysShiftResponse } from '../todays-shift/types/shift.types'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'
import { toast } from 'sonner'

const shiftWithOrders: TodaysShiftResponse = {
  date: '2026-07-20',
  hasAllocation: true,
  vehicleAllocation: { id: 'alloc-1', vehicleId: 'veh-1', date: '2026-07-20' },
  vehicle: {
    id: 'veh-1',
    registration: 'TRK-001',
    capacity: 5000,
    type: 'Tanker',
  },
  shift: {
    id: 'shift-1',
    status: 'active',
    startedAt: '2026-07-20T08:00:00Z',
    endedAt: null,
  },
  orders: [
    {
      id: 'order-123',
      destinationId: 'hub-1',
      product: 'diesel',
      quantity: 5000,
      deliveryDate: '2026-07-20',
      assignedDriverId: 'drv-1',
      status: 'assigned',
      failureReason: null,
      destinationDetails: {
        name: 'Downtown Hub',
        type: 'hub',
        address: '123 Main St',
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
    },
  ],
}

describe('DeliveriesPage', () => {
  test('shows the assigned delivery for the active shift', async () => {
    ;(api.get as jest.Mock).mockResolvedValue({ data: shiftWithOrders })

    renderWithProviders(<DeliveriesPage />)

    expect(await screen.findByText('Order #123')).toBeInTheDocument()
    expect(screen.getByText('Downtown Hub')).toBeInTheDocument()
    expect(screen.getByText('5,000 L')).toBeInTheDocument()
  })

  test('completes a delivery and shows the updated stock in a success message', async () => {
    const user = userEvent.setup()

    ;(api.get as jest.Mock).mockResolvedValue({ data: shiftWithOrders })
    ;(api.put as jest.Mock).mockResolvedValueOnce({
      data: {
        message: 'Delivery completed',
        order: { ...shiftWithOrders.orders[0], status: 'completed' },
        inventoryUpdated: {
          hubName: 'Downtown Hub',
          product: 'diesel',
          newStock: 12000,
        },
      },
    })

    renderWithProviders(<DeliveriesPage />)

    const completeButton = await screen.findByRole('button', {
      name: 'Mark Completed',
    })
    await user.click(completeButton)

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/driver/orders/order-123/complete')
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
    })
  })

  test('ends the active shift', async () => {
    const user = userEvent.setup()

    ;(api.get as jest.Mock).mockResolvedValue({ data: shiftWithOrders })
    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        message: 'Shift ended',
        shift: {
          ...shiftWithOrders.shift,
          status: 'ended',
          endedAt: '2026-07-20T17:00:00Z',
        },
      },
    })

    renderWithProviders(<DeliveriesPage />)

    const endShiftButton = await screen.findByRole('button', {
      name: 'End Shift',
    })
    await user.click(endShiftButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/driver/shift/end')
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Shift ended successfully!')
    })
  })
})
