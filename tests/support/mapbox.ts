import type { Page } from '@playwright/test'

/**
 * Hub creation, the driver Map page, and the admin Live Fleet map all render
 * a real `mapbox-gl` map (unlike the Jest unit tests, which swap in
 * `__mocks__/mapbox-gl.js` since jsdom has no WebGL). Playwright runs a real
 * browser, so the real library loads - but we still don't want tests hitting
 * the actual Mapbox network (slow, flaky, needs a live token/quota).
 *
 * We block all Mapbox network traffic by default, and optionally stub the
 * forward-geocoding search endpoint so "search for an address" flows can be
 * driven deterministically without ever touching the map canvas.
 */
export async function mockMapbox(
  page: Page,
  options: {
    geocodeResults?: Array<{
      id: string
      place_name: string
      center: [number, number]
    }>
  } = {},
) {
  // Broad block first (registered first = lowest priority in Playwright's
  // LIFO route resolution), so the more specific geocoding stub below can
  // still take over for that one endpoint.
  await page.route('https://api.mapbox.com/**', (route) => route.abort())
  await page.route('https://events.mapbox.com/**', (route) => route.abort())

  if (options.geocodeResults) {
    await page.route(
      'https://api.mapbox.com/geocoding/v5/**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ features: options.geocodeResults }),
        })
      },
    )
  }
}
