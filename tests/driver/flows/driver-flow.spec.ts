import { test, expect } from '@playwright/test'
import { loginAsDriver } from '../../support/auth'
import { mockMapbox } from '../../support/mapbox'

/**
 * End-to-end driver journey:
 *   Start shift -> View deliveries -> Send GPS updates -> Complete delivery -> End shift
 *
 * A single mutable `state` object backs every `/driver/*` mock so each step
 * sees the results of the previous one, mirroring how the real backend would
 * persist shift/order/gps state across requests.
 */

const VEHICLE = {
  id: 'veh-1',
  registration: 'TRK-001',
  capacity: 5000,
  type: 'Tanker',
}
const TODAY = '2026-07-20'

const ORDER_BASE = {
  id: 'order-123',
  destinationId: 'hub-1',
  product: 'diesel',
  quantity: 5000,
  deliveryDate: TODAY,
  assignedDriverId: 'drv-1',
  failureReason: null as string | null,
  destinationDetails: {
    name: 'Downtown Hub',
    type: 'hub',
    address: '123 Main St',
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
}

test('Driver starts a shift, views deliveries, pings GPS, completes a delivery, and ends the shift', async ({
  page,
}) => {
  await loginAsDriver(page)
  await mockMapbox(page)

  const state = {
    shiftStatus: null as 'active' | 'ended' | null,
    orderStatus: 'assigned' as 'assigned' | 'completed',
    gpsUpdatedAt: null as string | null,
  }

  await page.route('**/api/driver/shift/today', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: TODAY,
        hasAllocation: true,
        vehicleAllocation: { id: 'alloc-1', vehicleId: 'veh-1', date: TODAY },
        vehicle: VEHICLE,
        shift:
          state.shiftStatus === null
            ? null
            : {
                id: 'shift-1',
                status: state.shiftStatus,
                startedAt: `${TODAY}T08:00:00Z`,
                endedAt:
                  state.shiftStatus === 'ended' ? `${TODAY}T17:00:00Z` : null,
              },
        gps: { lat: 40.7128, lng: -74.006, updatedAt: state.gpsUpdatedAt },
        orders: [{ ...ORDER_BASE, status: state.orderStatus }],
      }),
    })
  })

  await page.route('**/api/driver/shift/start', async (route) => {
    state.shiftStatus = 'active'
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Shift started',
        shift: {
          id: 'shift-1',
          status: 'active',
          startedAt: `${TODAY}T08:00:00Z`,
          endedAt: null,
        },
      }),
    })
  })

  await page.route('**/api/driver/shift/end', async (route) => {
    state.shiftStatus = 'ended'
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Shift ended',
        shift: {
          id: 'shift-1',
          status: 'ended',
          startedAt: `${TODAY}T08:00:00Z`,
          endedAt: `${TODAY}T17:00:00Z`,
        },
      }),
    })
  })

  await page.route('**/api/driver/gps', async (route) => {
    const body = route.request().postDataJSON() as { lat: number; lng: number }
    state.gpsUpdatedAt = `${TODAY}T09:00:00Z`

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'GPS updated',
        gps: {
          driverId: 'drv-1',
          vehicleId: 'veh-1',
          ...body,
          updatedAt: state.gpsUpdatedAt,
        },
      }),
    })
  })

  await page.route('**/api/driver/orders/order-123/complete', async (route) => {
    state.orderStatus = 'completed'
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Delivery completed',
        order: { ...ORDER_BASE, status: 'completed' },
        inventoryUpdated: {
          hubName: 'Downtown Hub',
          product: 'diesel',
          newStock: 12000,
        },
      }),
    })
  })

  // 1. Start shift
  await page.goto('/driver')
  await expect(
    page.getByRole('heading', { name: "Today's Shift" }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Start Shift' }).click()
  await expect(page.getByText('Shift started successfully!')).toBeVisible()
  await expect(page.getByText('Shift Active (In Progress)')).toBeVisible()

  // 2. View deliveries
  await page.goto('/driver/deliveries')
  await expect(page.getByText('Order #123')).toBeVisible()
  await expect(page.getByText('Downtown Hub')).toBeVisible()

  // 3. Send a GPS update from the map page
  await page.goto('/driver/map')
  const pingButton = page.getByRole('button', { name: /Ping Dispatch/i })
  await expect(pingButton).toBeEnabled()
  await pingButton.click()
  await expect(
    page.getByText('GPS ping successfully sent to dispatcher!'),
  ).toBeVisible()

  // 4. Complete the delivery
  await page.goto('/driver/deliveries')
  await page.getByRole('button', { name: 'Mark Completed' }).click()
  await expect(page.getByText('Delivery Completed!')).toBeVisible()

  // 5. End the shift
  await page.getByRole('button', { name: 'End Shift' }).click()
  await expect(page.getByText('Shift ended successfully!')).toBeVisible()

  await page.goto('/driver')
  await expect(
    page.getByText('You have completed your shift for today.'),
  ).toBeVisible()
})
