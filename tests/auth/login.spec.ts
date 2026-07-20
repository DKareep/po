import { test, expect } from '@playwright/test'
import { paginated } from '../support/api'

test.describe('Login', () => {
  test('logs in as admin and lands on the dashboard', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      const body = route.request().postDataJSON() as {
        username: string
        password: string
      }

      expect(body).toEqual({ username: 'admin', password: 'fpadmin!123' })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-admin-token',
          user: {
            id: 'user-admin-1',
            username: 'admin',
            role: 'admin',
            driverId: '',
            name: 'Ava Admin',
          },
        }),
      })
    })

    // Dashboard fans out into 5 list requests on load - stub them all empty.
    for (const path of ['hubs', 'terminals', 'drivers', 'vehicles', 'orders']) {
      await page.route(`**/api/${path}**`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated([])),
        })
      })
    }

    await page.goto('/login')
    await page.getByRole('button', { name: /admin login/i }).click()
    await expect(page).toHaveURL(/\/login\/admin$/)

    // Fields are pre-filled with the admin default credentials.
    await page.getByRole('button', { name: 'Login as Admin' }).click()

    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByText('Ava Admin • (Admin)')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('logs in as driver and lands on today’s shift', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      const body = route.request().postDataJSON() as {
        username: string
        password: string
      }

      expect(body).toEqual({ username: 'john_driver', password: 'driver123' })

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-driver-token',
          user: {
            id: 'user-driver-1',
            username: 'john_driver',
            role: 'driver',
            driverId: 'drv-1',
            name: 'John Doe',
          },
        }),
      })
    })

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

    await page.goto('/login')
    await page.getByRole('button', { name: /driver login/i }).click()
    await expect(page).toHaveURL(/\/login\/driver$/)

    await page.getByRole('button', { name: 'Login as Driver' }).click()

    await expect(page).toHaveURL(/\/driver$/)
    await expect(page.getByText('John Doe • (Driver)')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: "Today's Shift" }),
    ).toBeVisible()
  })

  test('shows an error toast and stays on the login page for bad credentials', async ({
    page,
  }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid username or password' }),
      })
    })

    await page.goto('/login/admin')
    await page.getByRole('button', { name: 'Login as Admin' }).click()

    await expect(
      page.getByText('Something went wrong, try again'),
    ).toBeVisible()
    await expect(page).toHaveURL(/\/login\/admin$/)
  })
})
