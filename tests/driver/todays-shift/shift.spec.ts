import { test, expect } from '@playwright/test'
import { loginAsDriver } from '../../support/auth'

const VEHICLE = {
  id: 'veh-1',
  registration: 'TRK-001',
  capacity: 5000,
  type: 'Tanker',
}

test.describe('Driver - Today’s Shift', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDriver(page)
  })

  test('starts the shift when a vehicle is allocated', async ({ page }) => {
    let shiftStarted = false

    await page.route('**/api/driver/shift/today', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2026-07-20',
          hasAllocation: true,
          vehicleAllocation: {
            id: 'alloc-1',
            vehicleId: 'veh-1',
            date: '2026-07-20',
          },
          vehicle: VEHICLE,
          shift: shiftStarted
            ? {
                id: 'shift-1',
                status: 'active',
                startedAt: '2026-07-20T08:00:00Z',
                endedAt: null,
              }
            : null,
          orders: [],
        }),
      })
    })

    await page.route('**/api/driver/shift/start', async (route) => {
      shiftStarted = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Shift started',
          shift: {
            id: 'shift-1',
            status: 'active',
            startedAt: '2026-07-20T08:00:00Z',
            endedAt: null,
          },
        }),
      })
    })

    await page.goto('/driver')
    await expect(
      page.getByRole('heading', { name: "Today's Shift" }),
    ).toBeVisible()
    await expect(page.getByText('TRK-001')).toBeVisible()

    const startButton = page.getByRole('button', { name: 'Start Shift' })
    await expect(startButton).toBeEnabled()
    await startButton.click()

    await expect(page.getByText('Shift started successfully!')).toBeVisible()
    await expect(page.getByText('Shift Active (In Progress)')).toBeVisible()
    await expect(page.getByRole('button', { name: 'End Shift' })).toBeVisible()
  })

  test('disables Start Shift when there is no vehicle allocation', async ({
    page,
  }) => {
    await page.route('**/api/driver/shift/today', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2026-07-20',
          hasAllocation: false,
          vehicleAllocation: null,
          vehicle: null,
          shift: null,
          orders: [],
        }),
      })
    })

    await page.goto('/driver')

    const startButton = page.getByRole('button', { name: 'Start Shift' })
    await expect(startButton).toBeVisible()
    await expect(startButton).toBeDisabled()
    await expect(
      page.getByText('* Allocation required to start shift'),
    ).toBeVisible()
    await expect(page.getByText('No Vehicle Allocated')).toBeVisible()
  })

  test('ends an active shift', async ({ page }) => {
    let shiftEnded = false

    await page.route('**/api/driver/shift/today', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: '2026-07-20',
          hasAllocation: true,
          vehicleAllocation: {
            id: 'alloc-1',
            vehicleId: 'veh-1',
            date: '2026-07-20',
          },
          vehicle: VEHICLE,
          shift: {
            id: 'shift-1',
            status: shiftEnded ? 'ended' : 'active',
            startedAt: '2026-07-20T08:00:00Z',
            endedAt: shiftEnded ? '2026-07-20T17:00:00Z' : null,
          },
          orders: [],
        }),
      })
    })

    await page.route('**/api/driver/shift/end', async (route) => {
      shiftEnded = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Shift ended',
          shift: {
            id: 'shift-1',
            status: 'ended',
            startedAt: '2026-07-20T08:00:00Z',
            endedAt: '2026-07-20T17:00:00Z',
          },
        }),
      })
    })

    await page.goto('/driver')

    await page.getByRole('button', { name: 'End Shift' }).click()

    await expect(page.getByText('Shift ended successfully!')).toBeVisible()
    await expect(
      page.getByText('You have completed your shift for today.'),
    ).toBeVisible()
  })
})
