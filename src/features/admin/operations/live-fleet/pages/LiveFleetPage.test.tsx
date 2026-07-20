import { screen, waitFor } from '@testing-library/react'

import { renderWithProviders } from '@/test/test-utils'
import LiveFleetPage from './LiveFleetPage'
import type { LiveFleetResponseItem } from '../api/getLiveFleet'

// The map itself renders to a canvas via mapbox-gl and exposes no
// user-visible text; what the admin actually sees update in real time is
// the sidebar list, which is driven by the same polled data the map uses.
jest.mock('../components/LiveFleetMap', () => ({
  LiveFleetMap: () => null,
}))

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}))

import { api } from '@/services/api'

function allocation(
  overrides: Partial<LiveFleetResponseItem> = {},
): LiveFleetResponseItem {
  return {
    allocationId: 'alloc-1',
    date: '2026-07-20',
    driver: { id: 'drv-1', name: 'John Doe', phone: '555-0100' },
    vehicle: {
      id: 'veh-1',
      registration: 'TRK-001',
      capacity: 5000,
      type: 'Tanker',
    },
    shiftStatus: 'active',
    gps: {
      lat: 40.7128,
      lng: -74.006,
      updatedAt: '2026-07-20T09:00:00Z',
      source: 'driver',
    },
    orders: [
      {
        id: 'order-1',
        destinationId: 'hub-1',
        product: 'diesel',
        quantity: 5000,
        status: 'assigned',
      },
    ],
    ...overrides,
  }
}

describe('LiveFleetPage (real-time driver locations)', () => {
  test('shows the driver on the fleet list once fleet data loads', async () => {
    ;(api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/fleet/map') return Promise.resolve({ data: [allocation()] })
      if (url === '/fleet/inventory')
        return Promise.resolve({ data: { threshold: 0, items: [] } })
      return Promise.reject(new Error(`Unexpected GET ${url}`))
    })

    renderWithProviders(<LiveFleetPage />)

    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('TRK-001')).toBeInTheDocument()
  })

  test('reflects a driver order completing after the next poll', async () => {
    ;(api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/fleet/map') return Promise.resolve({ data: [allocation()] })
      if (url === '/fleet/inventory')
        return Promise.resolve({ data: { threshold: 0, items: [] } })
      return Promise.reject(new Error(`Unexpected GET ${url}`))
    })

    const { queryClient } = renderWithProviders(<LiveFleetPage />)

    expect(await screen.findByText('0/1 Done')).toBeInTheDocument()

    // Simulate the driver completing their delivery: the next poll (React
    // Query's refetchInterval) picks up the updated allocation.
    ;(api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/fleet/map')
        return Promise.resolve({
          data: [
            allocation({
              orders: [
                {
                  id: 'order-1',
                  destinationId: 'hub-1',
                  product: 'diesel',
                  quantity: 5000,
                  status: 'completed',
                },
              ],
            }),
          ],
        })
      if (url === '/fleet/inventory')
        return Promise.resolve({ data: { threshold: 0, items: [] } })
      return Promise.reject(new Error(`Unexpected GET ${url}`))
    })

    await queryClient.refetchQueries({ queryKey: ['liveFleet'] })

    await waitFor(() => {
      expect(screen.getByText('1/1 Done')).toBeInTheDocument()
    })
  })
})
