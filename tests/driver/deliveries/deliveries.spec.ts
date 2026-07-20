import { test, expect } from '@playwright/test'
import { loginAsDriver } from '../../support/auth'

const baseShift = {
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
  orders: [
    {
      id: 'order-123',
      destinationId: 'hub-1',
      product: 'diesel',
      quantity: 5000,
      deliveryDate: '2026-07-20',
      assignedDriverId: 'drv-1',
      status: 'assigned',
      failureReason: null,
      destinationDetails: {
        name: 'Downtown Hub',
        type: 'hub',
        address: '123 Main St',
        coordinates: { lat: 40.7128, lng: -74.006 },
      },
    },
  ],
}

test.describe('Driver - Deliveries', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDriver(page)
  })

  test('shows the assigned delivery for the active shift', async ({ page }) => {
    await page.route('**/api/driver/shift/today', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(baseShift),
      }),
    )

    await page.goto('/driver/deliveries')

    await expect(page.getByText('Order #123')).toBeVisible()
    await expect(page.getByText('Downtown Hub')).toBeVisible()
    await expect(page.getByText('5,000 gal')).toBeVisible()
  })

  test('completes a delivery and shows the updated stock', async ({ page }) => {
    await page.route('**/api/driver/shift/today', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(baseShift),
      }),
    )

    await page.route('**/api/driver/orders/order-123/complete', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Delivery completed',
          order: { ...baseShift.orders[0], status: 'completed' },
          inventoryUpdated: {
            hubName: 'Downtown Hub',
            product: 'diesel',
            newStock: 12000,
          },
        }),
      }),
    )

    await page.goto('/driver/deliveries')

    await page.getByRole('button', { name: 'Mark Completed' }).click()

    await expect(page.getByText('Delivery Completed!')).toBeVisible()
    await expect(page.getByText(/Downtown Hub stock updated/)).toBeVisible()
  })

  test('marks a delivery as failed with a reason', async ({ page }) => {
    await page.route('**/api/driver/shift/today', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(baseShift),
      }),
    )

    await page.route('**/api/driver/orders/order-123/fail', async (route) => {
      const body = route.request().postDataJSON() as { reason: string }
      expect(body.reason).toBe('Access road blocked by construction')

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Delivery failed',
          order: {
            ...baseShift.orders[0],
            status: 'failed',
            failureReason: body.reason,
          },
        }),
      })
    })

    await page.goto('/driver/deliveries')

    await page.getByRole('button', { name: 'Mark Failed' }).click()

    const modal = page.getByRole('dialog', {
      name: 'Mark Delivery as Failed',
    })
    await modal
      .getByLabel('Reason for Failure')
      .fill('Access road blocked by construction')
    await modal.getByRole('button', { name: 'Confirm Failure' }).click()

    await expect(
      page.getByText(
        'Delivery marked as Failed (Reason: Access road blocked by construction)',
      ),
    ).toBeVisible()
  })

  test('disables delivery actions when the shift is not active', async ({
    page,
  }) => {
    await page.route('**/api/driver/shift/today', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...baseShift, shift: null }),
      }),
    )

    await page.goto('/driver/deliveries')

    await expect(page.getByText('Shift is Inactive')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Mark Completed' }),
    ).toBeDisabled()
    await expect(
      page.getByRole('button', { name: 'Mark Failed' }),
    ).toBeDisabled()
  })
})
