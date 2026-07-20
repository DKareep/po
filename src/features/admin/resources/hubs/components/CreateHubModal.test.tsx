import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import { CreateHubModal } from './CreateHubModal'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'

describe('CreateHubModal', () => {
  test('creates a hub from the form and closes the modal on success', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 'hub-1', name: 'Downtown Distribution Hub' },
    })

    renderWithProviders(<CreateHubModal open onClose={onClose} />)

    await user.type(screen.getByLabelText('Name'), 'Downtown Distribution Hub')
    await user.type(
      screen.getByLabelText('Address'),
      '123 Main St, City Center',
    )

    // Location is required: click the map to drop a pin (mocked mapbox-gl
    // reports a fixed coordinate for any click on the map container).
    fireEvent.click(screen.getByTestId('location-map'))

    await waitFor(() => {
      expect(screen.getByDisplayValue('40.7128')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Create Hub' }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/hubs', {
        name: 'Downtown Distribution Hub',
        address: '123 Main St, City Center',
        coordinates: { lat: 40.7128, lng: -74.006 },
      })
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  test('shows validation errors and does not submit when required fields are empty', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    renderWithProviders(<CreateHubModal open onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Create Hub' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Address is required')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
