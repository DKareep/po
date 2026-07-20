import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import MapPage from './MapPage'
import type { TodaysShiftResponse } from '../todays-shift/types/shift.types'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'
import { toast } from 'sonner'

const shiftWithGps: TodaysShiftResponse = {
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
  gps: { lat: 40.7128, lng: -74.006, updatedAt: null },
  orders: [],
}

describe('MapPage (driver GPS)', () => {
  test('sends the current GPS position to the dispatcher', async () => {
    const user = userEvent.setup()

    ;(api.get as jest.Mock).mockResolvedValue({ data: shiftWithGps })
    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        message: 'GPS updated',
        gps: {
          driverId: 'drv-1',
          vehicleId: 'veh-1',
          lat: 40.7128,
          lng: -74.006,
          updatedAt: '2026-07-20T09:00:00Z',
        },
      },
    })

    renderWithProviders(<MapPage />)

    const pingButton = await screen.findByRole('button', {
      name: /Ping Dispatch/i,
    })

    await waitFor(() => expect(pingButton).toBeEnabled())

    await user.click(pingButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/driver/gps', {
        lat: 40.7128,
        lng: -74.006,
      })
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'GPS ping successfully sent to dispatcher!',
      )
    })
  })
})
