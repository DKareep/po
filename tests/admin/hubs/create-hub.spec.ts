import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { mockMapbox } from '../../support/mapbox'
import { paginated } from '../../support/api'

test.describe('Admin - Create Hub', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('creates a hub by searching for a location and closes the modal', async ({
    page,
  }) => {
    await mockMapbox(page, {
      geocodeResults: [
        {
          id: 'place.1',
          place_name: '123 Main St, City Center, NY',
          center: [-74.006, 40.7128], // [lng, lat]
        },
      ],
    })

    const hubs: unknown[] = []

    await page.route('**/api/hubs**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated(hubs)),
        })
        return
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON() as {
          name: string
          address: string
          coordinates?: { lat: number; lng: number }
        }

        const created = { id: 'hub-1', type: 'hub', ...body }
        hubs.push(created)

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/admin/hubs')
    await expect(page.getByRole('heading', { name: 'Hubs' })).toBeVisible()

    await page.getByRole('button', { name: 'Create Hub' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Hub' })
    await modal.getByLabel('Name').fill('Downtown Distribution Hub')

    // Use the address search (backed by the mocked geocoding endpoint) to set
    // the location instead of driving the real Mapbox canvas directly - this
    // is both a realistic user flow and avoids flaky canvas-pixel clicking.
    await modal
      .getByPlaceholder('Type address to search location...')
      .fill('123 Main St')

    await modal
      .getByRole('button', { name: /123 Main St, City Center/ })
      .click()

    await expect(modal.getByLabel('Address')).toHaveValue(
      '123 Main St, City Center, NY',
    )

    // The Latitude/Longitude fields are plain read-only display fields (no
    // <label for>/id association), so target them positionally instead.
    const coordInputs = modal.locator('input[type="number"][readonly]')
    await expect(coordInputs.nth(0)).toHaveValue('40.7128') // Latitude
    await expect(coordInputs.nth(1)).toHaveValue('-74.006') // Longitude

    await modal.getByRole('button', { name: 'Create Hub' }).click()

    await expect(modal).not.toBeVisible()
    await expect(page.getByText('Downtown Distribution Hub')).toBeVisible()
    await expect(page.getByText('123 Main St, City Center, NY')).toBeVisible()
  })

  test('shows validation errors and does not submit when required fields are empty', async ({
    page,
  }) => {
    await mockMapbox(page)

    let postCalled = false
    await page.route('**/api/hubs**', async (route) => {
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

    await page.goto('/admin/hubs')
    await page.getByRole('button', { name: 'Create Hub' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Hub' })
    await modal.getByRole('button', { name: 'Create Hub' }).click()

    await expect(modal.getByText('Name is required')).toBeVisible()
    await expect(modal.getByText('Address is required')).toBeVisible()
    expect(postCalled).toBe(false)
    await expect(modal).toBeVisible()
  })
})
