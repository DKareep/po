import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { paginated } from '../../support/api'

const DRIVER_1 = {
  id: 'drv-1',
  name: 'John Doe',
  license: 'L1',
  phone: '555-0100',
}
const DRIVER_2 = {
  id: 'drv-2',
  name: 'Jane Smith',
  license: 'L2',
  phone: '555-0200',
}
const VEHICLE = {
  id: 'veh-1',
  registration: 'TRK-001',
  capacity: 5000,
  type: 'Tanker',
}

const EXISTING_ALLOCATION = {
  id: 'alloc-existing',
  vehicleId: 'veh-1',
  driverId: 'drv-1',
  date: '2026-07-20',
  vehicleDetails: VEHICLE,
  driverDetails: DRIVER_1,
}

test.describe('Error handling - allocating an already-allocated vehicle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)

    await page.route('**/api/drivers**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([DRIVER_1, DRIVER_2])),
      }),
    )
    await page.route('**/api/vehicles**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([VEHICLE])),
      }),
    )
    await page.route('**/api/allocations**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated([EXISTING_ALLOCATION])),
        })
        return
      }

      if (request.method() === 'POST') {
        // The vehicle is already allocated for that date - the backend
        // rejects a second allocation for the same vehicle/date pair.
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Vehicle already allocated for this date',
          }),
        })
        return
      }

      await route.fallback()
    })
  })

  test('shows a clear error and keeps the vehicle unallocated when double-booked', async ({
    page,
  }) => {
    await page.goto('/admin/allocation')

    // Try to allocate the same vehicle (already booked to John Doe today) to
    // a second driver on the same date via the quick allocate form.
    const sidebar = page.getByText('Quick Allocate').locator('..')

    await sidebar.getByRole('button', { name: 'Vehicle', exact: true }).click()
    await page.getByRole('option', { name: /TRK-001/ }).click()

    await sidebar.getByRole('button', { name: 'Driver', exact: true }).click()
    await page.getByRole('option', { name: 'Jane Smith' }).click()

    await sidebar.getByRole('button', { name: 'Allocate Driver' }).click()

    await expect(
      page.getByText('Vehicle already allocated for this date'),
    ).toBeVisible()

    // No success toast, and the original allocation is unaffected.
    await expect(
      page.getByText('Vehicle allocated successfully'),
    ).not.toBeVisible()
  })

  test('the Allocate button in the details modal also surfaces the same error', async ({
    page,
  }) => {
    await page.goto('/admin/allocation')

    await page.getByRole('button', { name: 'Create Allocation' }).click()

    const modal = page.getByRole('dialog')
    await modal.getByRole('button', { name: 'Select Vehicle' }).click()
    await page.getByRole('option', { name: /TRK-001/ }).click()

    await modal.getByRole('button', { name: 'Select Driver' }).click()
    await page.getByRole('option', { name: 'Jane Smith' }).click()

    await modal.getByRole('button', { name: 'Allocate' }).click()

    await expect(
      page.getByText('Vehicle already allocated for this date'),
    ).toBeVisible()
    // Modal stays open so the admin can correct the selection.
    await expect(modal).toBeVisible()
  })
})
