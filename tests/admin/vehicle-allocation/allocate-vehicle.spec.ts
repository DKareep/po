import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { paginated } from '../../support/api'

const DRIVER = {
  id: 'drv-1',
  name: 'John Doe',
  license: 'L1',
  phone: '555-0100',
}
const VEHICLE = {
  id: 'veh-1',
  registration: 'TRK-001',
  capacity: 5000,
  type: 'Tanker',
}

test.describe('Admin - Allocate Vehicle to Driver', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)

    await page.route('**/api/drivers**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([DRIVER])),
      }),
    )
    await page.route('**/api/vehicles**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([VEHICLE])),
      }),
    )
  })

  test('allocates a vehicle to a driver via the quick allocate form', async ({
    page,
  }) => {
    const allocations: unknown[] = []

    await page.route('**/api/allocations**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated(allocations)),
        })
        return
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON() as {
          vehicleId: string
          driverId: string
          date: string
        }
        expect(body).toEqual({
          vehicleId: 'veh-1',
          driverId: 'drv-1',
          date: expect.any(String),
        })

        const created = {
          id: 'alloc-1',
          ...body,
          vehicleDetails: VEHICLE,
          driverDetails: DRIVER,
        }
        allocations.push(created)

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Allocated', allocation: created }),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/admin/allocation')
    await expect(
      page.getByRole('heading', { name: 'Vehicle Allocations' }),
    ).toBeVisible()

    const sidebar = page.getByText('Quick Allocate').locator('..')
    await sidebar.getByRole('button', { name: 'Vehicle', exact: true }).click()
    await page.getByRole('option', { name: /TRK-001/ }).click()

    await sidebar.getByRole('button', { name: 'Driver', exact: true }).click()
    await page.getByRole('option', { name: 'John Doe' }).click()

    await sidebar.getByRole('button', { name: 'Allocate Driver' }).click()

    await expect(page.getByText('Vehicle allocated successfully')).toBeVisible()

    // Today's date is already in view by default, so the new event shows up
    // on the calendar as soon as the allocations list is invalidated. We only
    // assert it's attached (not `toBeVisible`) since FullCalendar briefly
    // renders event harnesses with `visibility: hidden` while it measures
    // layout, which makes a strict visibility check flaky.
    await expect(page.getByText(/TRK-001.*John Doe/).first()).toBeAttached()
  })
})
