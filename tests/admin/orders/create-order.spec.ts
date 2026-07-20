import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { paginated } from '../../support/api'

const HUB = {
  id: 'hub-1',
  name: 'Downtown Hub',
  address: '1 Main St',
  type: 'hub',
  coordinates: { lat: 40.7128, lng: -74.006 },
}

const DRIVER = {
  id: 'drv-1',
  name: 'John Doe',
  license: 'L1',
  phone: '555-0100',
}

test.describe('Admin - Create Order', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)

    // The Orders page loads hubs/terminals/drivers up front to populate the
    // Create Order form's destination and driver selectors.
    await page.route('**/api/hubs**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([HUB])),
      }),
    )
    await page.route('**/api/terminals**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([])),
      }),
    )
    await page.route('**/api/drivers**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(paginated([DRIVER])),
      }),
    )
  })

  test('creates an order with a destination, product and driver', async ({
    page,
  }) => {
    const orders: unknown[] = []

    await page.route('**/api/orders**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated(orders)),
        })
        return
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON() as Record<string, unknown>
        expect(body).toMatchObject({
          destinationId: 'hub-1',
          product: 'diesel',
          quantity: 5000,
          assignedDriverId: 'drv-1',
        })

        const created = { id: 'order-1', status: 'assigned', ...body }
        orders.push(created)

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/admin/orders')
    await expect(page.getByRole('heading', { name: 'Orders' })).toBeVisible()

    await page.getByRole('button', { name: 'Create Order' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Order' })
    await modal.getByRole('button', { name: 'Destination' }).click()
    await page.getByRole('option', { name: /Downtown Hub/ }).click()

    await modal.getByRole('button', { name: 'Product' }).click()
    await page.getByRole('option', { name: 'Diesel' }).click()

    await modal.getByLabel('Quantity (L)').fill('5000')

    await modal.getByRole('button', { name: 'Assigned Driver' }).click()
    await page.getByRole('option', { name: 'John Doe' }).click()

    await modal.getByRole('button', { name: 'Create Order' }).click()

    await expect(modal).not.toBeVisible()
    await expect(page.getByText('order-1')).toBeVisible()
  })

  test('shows validation errors when required fields are missing', async ({
    page,
  }) => {
    let postCalled = false

    await page.route('**/api/orders**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated([])),
        })
        return
      }

      if (request.method() === 'POST') {
        postCalled = true
        await route.fulfill({ status: 201, body: '{}' })
        return
      }

      await route.fallback()
    })

    await page.goto('/admin/orders')
    await page.getByRole('button', { name: 'Create Order' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Order' })
    await modal.getByRole('button', { name: 'Create Order' }).click()

    await expect(modal.getByText('Destination is required')).toBeVisible()
    await expect(modal.getByText('Product is required')).toBeVisible()
    expect(postCalled).toBe(false)
  })
})
