import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/test-utils'
import { CreateProductModal } from './CreateProductModal'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'

describe('CreateProductModal', () => {
  test('creates a product from the form and closes the modal on success', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    ;(api.post as jest.Mock).mockResolvedValueOnce({
      data: { id: 'diesel', name: 'Diesel', unit: 'Liters' },
    })

    renderWithProviders(<CreateProductModal open onClose={onClose} />)

    await user.type(screen.getByLabelText('ID'), 'diesel')
    await user.type(screen.getByLabelText('Name'), 'Diesel')

    await user.click(screen.getByRole('button', { name: 'Create Product' }))

    // Note: `product.schema.ts` doesn't declare `id`, so zodResolver strips
    // it from the submitted values even though the form collects it.
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/products', {
        name: 'Diesel',
        unit: 'Liters',
      })
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  test('shows a validation error and does not submit when name is empty', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()

    renderWithProviders(<CreateProductModal open onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Create Product' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(api.post).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
