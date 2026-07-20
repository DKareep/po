import { test, expect } from '@playwright/test'
import { loginAsDriver } from '../../support/auth'
import { mockMapbox } from '../../support/mapbox'

const shiftWithGps = {
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

test.describe('Driver - GPS map', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDriver(page)
    await mockMapbox(page)
  })

  test('sends the current simulated GPS position to the dispatcher', async ({
    page,
  }) => {
    await page.route('**/api/driver/shift/today', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(shiftWithGps),
      }),
    )

    await page.route('**/api/driver/gps', async (route) => {
      const body = route.request().postDataJSON() as {
        lat: number
        lng: number
      }
      expect(body).toEqual({ lat: 40.7128, lng: -74.006 })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'GPS updated',
          gps: {
            driverId: 'drv-1',
            vehicleId: 'veh-1',
            ...body,
            updatedAt: '2026-07-20T09:00:00Z',
          },
        }),
      })
    })

    await page.goto('/driver/map')

    const pingButton = page.getByRole('button', { name: /Ping Dispatch/i })
    await expect(pingButton).toBeEnabled()
    await pingButton.click()

    await expect(
      page.getByText('GPS ping successfully sent to dispatcher!'),
    ).toBeVisible()
  })
})
