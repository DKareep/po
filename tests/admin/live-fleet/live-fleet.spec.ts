import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { mockMapbox } from '../../support/mapbox'

function allocation(overrides: Record<string, unknown> = {}) {
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

test.describe('Admin - Live Fleet', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    // The map still mounts underneath the list view; block real Mapbox
    // network calls so the page loads fast and deterministically.
    await mockMapbox(page)

    await page.route('**/api/fleet/inventory', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ threshold: 0, items: [] }),
      }),
    )
  })

  test('shows active drivers and vehicles on load', async ({ page }) => {
    await page.route('**/api/fleet/map', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([allocation()]),
      }),
    )

    await page.goto('/admin/fleet')

    await expect(
      page.getByRole('heading', { name: 'Live Fleet' }),
    ).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('TRK-001')).toBeVisible()
    // Exact-text "Active" appears twice by design (the sidebar's stats
    // summary count label, and the allocation card's status badge) - both
    // confirm the same thing, so just check at least one is showing.
    await expect(
      page.getByText('Active', { exact: true }).first(),
    ).toBeVisible()
    await expect(page.getByText('0/1 Done')).toBeVisible()
  })

  test('reflects a driver location/order update after a manual refresh', async ({
    page,
  }) => {
    let callCount = 0

    await page.route('**/api/fleet/map', async (route) => {
      callCount += 1

      // First load: order still in progress. After the admin forces a
      // refresh, the "driver" has moved on and completed the delivery -
      // simulating the real-time polling picking up a GPS/order update.
      const data =
        callCount === 1
          ? [allocation()]
          : [
              allocation({
                gps: {
                  lat: 40.73,
                  lng: -74.01,
                  updatedAt: '2026-07-20T09:05:00Z',
                  source: 'driver',
                },
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
            ]

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      })
    })

    await page.goto('/admin/fleet')

    await expect(page.getByText('0/1 Done')).toBeVisible()

    // Force a refresh via the map's refresh control, simulating the next
    // poll tick picking up the driver's new location/delivery status.
    await page.getByTitle('Force Refresh Data').click()

    await expect(page.getByText('1/1 Done')).toBeVisible()
  })
})
