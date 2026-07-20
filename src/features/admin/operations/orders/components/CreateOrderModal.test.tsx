import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import { CreateOrderModal } from './CreateOrderModal'
import type { DestinationItem, DriverItem } from './OrderForm'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'

const destinations: DestinationItem[] = [
  { id: 'hub-1', name: 'Downtown Hub', type: 'hub' },
]

const drivers: DriverItem[] = [{ id: 'drv-1', name: 'John Doe' }]

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerName: string | RegExp,
  optionName: string | RegExp,
) {
  await user.click(screen.getByRole('button', { name: triggerName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('CreateOrderModal', () => {
  test('creates an order with a selected destination, product and driver', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 'order-1' },
    })

    renderWithProviders(
      <CreateOrderModal
        open
        onClose={onClose}
        destinations={destinations}
        drivers={drivers}
      />,
    )

    await selectOption(user, 'Destination', /Downtown Hub/)
    await selectOption(user, 'Product', 'Diesel')
    await user.type(screen.getByLabelText('Quantity (L)'), '5000')
    await selectOption(user, 'Assigned Driver', 'John Doe')

    await user.click(screen.getByRole('button', { name: 'Create Order' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/orders',
        expect.objectContaining({
          destinationId: 'hub-1',
          product: 'diesel',
          quantity: 5000,
          assignedDriverId: 'drv-1',
        }),
      )
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  test('shows validation errors and does not submit when required fields are missing', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    renderWithProviders(
      <CreateOrderModal
        open
        onClose={onClose}
        destinations={destinations}
        drivers={drivers}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Create Order' }))

    expect(
      await screen.findByText('Destination is required'),
    ).toBeInTheDocument()
    expect(screen.getByText('Product is required')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
