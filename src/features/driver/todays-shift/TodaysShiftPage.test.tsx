import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import TodaysShiftPage from './TodaysShiftPage'
import type { TodaysShiftResponse } from './types/shift.types'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'
import { toast } from 'sonner'

const baseShift: TodaysShiftResponse = {
  date: '2026-07-20',
  hasAllocation: true,
  vehicleAllocation: { id: 'alloc-1', vehicleId: 'veh-1', date: '2026-07-20' },
  vehicle: {
    id: 'veh-1',
    registration: 'TRK-001',
    capacity: 5000,
    type: 'Tanker',
  },
  shift: null,
  orders: [],
}

describe('TodaysShiftPage', () => {
  test('starts the shift when the driver has a vehicle allocation', async () => {
    const user = userEvent.setup()

    ;(api.get as jest.Mock).mockResolvedValue({ data: baseShift })
    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: {
        message: 'Shift started',
        shift: {
          id: 'shift-1',
          status: 'active',
          startedAt: '2026-07-20T08:00:00Z',
          endedAt: null,
        },
      },
    })

    renderWithProviders(<TodaysShiftPage />)

    const startButton = await screen.findByRole('button', {
      name: 'Start Shift',
    })
    expect(startButton).toBeEnabled()

    await user.click(startButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/driver/shift/start')
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Shift started successfully!')
    })
  })

  test('disables Start Shift when the driver has no vehicle allocation', async () => {
    ;(api.get as jest.Mock).mockResolvedValue({
      data: { ...baseShift, hasAllocation: false, vehicle: null },
    })

    renderWithProviders(<TodaysShiftPage />)

    const startButton = await screen.findByRole('button', {
      name: 'Start Shift',
    })
    expect(startButton).toBeDisabled()
    expect(
      screen.getByText('* Allocation required to start shift'),
    ).toBeInTheDocument()
  })
})
