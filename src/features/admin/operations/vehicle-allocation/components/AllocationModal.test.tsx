import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import { AllocationModal } from './AllocationModal'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'
import { toast } from 'sonner'

const driversResponse = {
  data: [{ id: 'drv-1', name: 'John Doe', license: 'L1', phone: '555-0100' }],
  pagination: { page: 1, pageSize: 1000, totalItems: 1, totalPages: 1 },
}

const vehiclesResponse = {
  data: [
    { id: 'veh-1', registration: 'TRK-001', capacity: 5000, type: 'Tanker' },
  ],
  pagination: { page: 1, pageSize: 1000, totalItems: 1, totalPages: 1 },
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: string | RegExp,
  optionName: string | RegExp,
) {
  await user.click(await screen.findByRole('button', { name: triggerName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('AllocationModal', () => {
  beforeEach(() => {
    ;(api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/drivers') return Promise.resolve({ data: driversResponse })
      if (url === '/vehicles')
        return Promise.resolve({ data: vehiclesResponse })
      return Promise.reject(new Error(`Unexpected GET ${url}`))
    })
  })

  test('allocates a vehicle to a driver and shows a success message', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: { message: 'Allocated', allocation: { id: 'alloc-1' } },
    })

    renderWithProviders(<AllocationModal open onClose={onClose} />)

    await selectOption(user, 'Select Vehicle', /TRK-001/)
    await selectOption(user, 'Select Driver', 'John Doe')

    await user.click(screen.getByRole('button', { name: 'Allocate' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/allocations',
        expect.objectContaining({ vehicleId: 'veh-1', driverId: 'drv-1' }),
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        'Vehicle allocated successfully',
      )
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('shows the server error when the vehicle is already allocated for that date', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    ;(api.post as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { message: 'Vehicle already allocated for this date' },
      },
    })

    renderWithProviders(<AllocationModal open onClose={onClose} />)

    await selectOption(user, 'Select Vehicle', /TRK-001/)
    await selectOption(user, 'Select Driver', 'John Doe')

    await user.click(screen.getByRole('button', { name: 'Allocate' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Vehicle already allocated for this date',
        { duration: 5000 },
      )
    })

    // The modal stays open so the admin can correct the selection.
    expect(onClose).not.toHaveBeenCalled()
  })
})
