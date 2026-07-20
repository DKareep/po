import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { paginated } from '../../support/api'

test.describe('Admin - Create Product', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('creates a product from the form and lists it in the table', async ({
    page,
  }) => {
    const products: unknown[] = []

    await page.route('**/api/products**', async (route) => {
      const request = route.request()

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(paginated(products)),
        })
        return
      }

      if (request.method() === 'POST') {
        // `product.schema.ts` doesn't declare `id`, so zodResolver strips it
        // even though the form field collects it - the server assigns the id.
        const body = request.postDataJSON() as { name: string; unit: string }
        expect(body).toEqual({ name: 'Diesel', unit: 'Liters' })

        const created = { id: 'diesel', ...body }
        products.push(created)

        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(created),
        })
        return
      }

      await route.fallback()
    })

    await page.goto('/admin/products')
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()

    await page.getByRole('button', { name: 'Create Product' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Product' })
    await modal.getByLabel('ID').fill('diesel')
    await modal.getByLabel('Name').fill('Diesel')
    // "Unit" already defaults to "Liters".

    await modal.getByRole('button', { name: 'Create Product' }).click()

    await expect(modal).not.toBeVisible()
    // `exact` also makes text matching case-sensitive, which matters here:
    // the table has both an "ID" column ("diesel") and a "Name" column
    // ("Diesel").
    await expect(page.getByText('Diesel', { exact: true })).toBeVisible()
  })

  test('shows a validation error and does not submit when name is empty', async ({
    page,
  }) => {
    let postCalled = false

    await page.route('**/api/products**', async (route) => {
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

    await page.goto('/admin/products')
    await page.getByRole('button', { name: 'Create Product' }).click()

    const modal = page.getByRole('dialog', { name: 'Create Product' })
    await modal.getByLabel('Name').fill('')
    await modal.getByRole('button', { name: 'Create Product' }).click()

    await expect(modal.getByText('Name is required')).toBeVisible()
    expect(postCalled).toBe(false)
    await expect(modal).toBeVisible()
  })
})
