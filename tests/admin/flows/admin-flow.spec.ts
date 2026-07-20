import { test, expect } from '@playwright/test'
import { loginAsAdmin } from '../../support/auth'
import { mockMapbox } from '../../support/mapbox'
import { paginated } from '../../support/api'

/**
 * End-to-end admin journey:
 *   Create hub -> Create product -> Create order -> Allocate vehicle -> View on map
 *
 * A pre-existing driver and vehicle stand in for resources dispatch already
 * has on file (creating those isn't part of this journey). Everything else
 * (hub, product, order, allocation) is created through the UI and carried
 * forward via a small in-memory store backing the mocked API, so each step
 * sees the state left behind by the previous one - the same way the real
 * backend would.
 */

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
const TODAY = '2026-07-20'

test('Admin creates a hub, product and order, allocates a vehicle, and sees it on the live fleet map', async ({
  page,
}) => {
  await loginAsAdmin(page)
  await mockMapbox(page, {
    geocodeResults: [
      {
        id: 'place.1',
        place_name: '1 Distribution Way, Metro City',
        center: [-74.006, 40.7128],
      },
    ],
  })

  const hubs: Array<{
    id: string
    name: string
    address: string
    type: string
    coordinates?: { lat: number; lng: number }
  }> = []
  const products: Array<{ id: string; name: string; unit: string }> = []
  const orders: Array<{
    id: string
    destinationId: string
    product: string
    quantity: number
    deliveryDate: string
    assignedDriverId: string | null
    status: string
  }> = []
  const allocations: Array<{
    id: string
    vehicleId: string
    driverId: string
    date: string
    vehicleDetails: typeof VEHICLE
    driverDetails: typeof DRIVER
  }> = []

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
  await page.route('**/api/vehicles**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(paginated([VEHICLE])),
    }),
  )
  await page.route('**/api/fleet/inventory', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ threshold: 0, items: [] }),
    }),
  )

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
      const body = request.postDataJSON()
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
      const body = request.postDataJSON()
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
      const body = request.postDataJSON()
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
      const body = request.postDataJSON()
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

  // The live fleet feed reflects whatever's been allocated so far, combined
  // with the orders assigned to that driver - just like the real dispatch
  // backend would compute it from allocations + orders.
  await page.route('**/api/fleet/map', async (route) => {
    const data = allocations.map((alloc) => ({
      allocationId: alloc.id,
      date: alloc.date,
      driver: { id: DRIVER.id, name: DRIVER.name, phone: DRIVER.phone },
      vehicle: VEHICLE,
      shiftStatus: 'active',
      gps: {
        lat: 40.7128,
        lng: -74.006,
        updatedAt: `${TODAY}T09:00:00Z`,
        source: 'driver',
      },
      orders: orders
        .filter((o) => o.assignedDriverId === alloc.driverId)
        .map((o) => ({
          id: o.id,
          destinationId: o.destinationId,
          product: o.product,
          quantity: o.quantity,
          status: o.status,
        })),
    }))

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  })

  // 1. Create hub
  await page.goto('/admin/hubs')
  await page.getByRole('button', { name: 'Create Hub' }).click()
  let modal = page.getByRole('dialog', { name: 'Create Hub' })
  await modal.getByLabel('Name').fill('Downtown Distribution Hub')
  await modal
    .getByPlaceholder('Type address to search location...')
    .fill('1 Distribution Way')
  await modal
    .getByRole('button', { name: /1 Distribution Way, Metro City/ })
    .click()
  await modal.getByRole('button', { name: 'Create Hub' }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.getByText('Downtown Distribution Hub')).toBeVisible()

  // 2. Create product
  await page.goto('/admin/products')
  await page.getByRole('button', { name: 'Create Product' }).click()
  modal = page.getByRole('dialog', { name: 'Create Product' })
  await modal.getByLabel('ID').fill('diesel')
  await modal.getByLabel('Name').fill('Diesel')
  await modal.getByRole('button', { name: 'Create Product' }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.getByText('Diesel', { exact: true })).toBeVisible()

  // 3. Create order for the new hub, assigned to the existing driver
  await page.goto('/admin/orders')
  await page.getByRole('button', { name: 'Create Order' }).click()
  modal = page.getByRole('dialog', { name: 'Create Order' })

  await modal.getByRole('button', { name: 'Destination' }).click()
  await page.getByRole('option', { name: /Downtown Distribution Hub/ }).click()

  await modal.getByRole('button', { name: 'Product' }).click()
  await page.getByRole('option', { name: 'Diesel' }).click()

  await modal.getByLabel('Quantity (L)').fill('8000')

  await modal.getByRole('button', { name: 'Assigned Driver' }).click()
  await page.getByRole('option', { name: 'John Doe' }).click()

  await modal.getByRole('button', { name: 'Create Order' }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.getByText('order-1')).toBeVisible()

  // 4. Allocate the vehicle to the driver for today
  await page.goto('/admin/allocation')
  const sidebar = page.getByText('Quick Allocate').locator('..')
  await sidebar.getByRole('button', { name: 'Vehicle', exact: true }).click()
  await page.getByRole('option', { name: /TRK-001/ }).click()
  await sidebar.getByRole('button', { name: 'Driver', exact: true }).click()
  await page.getByRole('option', { name: 'John Doe' }).click()
  await sidebar.getByRole('button', { name: 'Allocate Driver' }).click()
  await expect(page.getByText('Vehicle allocated successfully')).toBeVisible()

  // 5. View the allocated driver + their order on the live fleet map
  await page.goto('/admin/fleet')
  await expect(page.getByRole('heading', { name: 'Live Fleet' })).toBeVisible()
  await expect(page.getByText('John Doe')).toBeVisible()
  await expect(page.getByText('TRK-001')).toBeVisible()
  await expect(page.getByText('0/1 Done')).toBeVisible()
})
