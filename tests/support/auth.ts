import type { Page } from '@playwright/test'

/**
 * The app is a Vite SPA whose auth state lives in two places, both written on
 * a successful `POST /auth/login`:
 *  - `localStorage.access_token`      -> read once at boot by `tokenStorage.load()`
 *  - `localStorage['auth-store']`     -> zustand `persist` snapshot read by the
 *                                        `useAuthStore` hook that route guards check
 *
 * For specs that exercise a *feature* (not the login screen itself) we skip
 * the login UI and seed both directly via `addInitScript`, which runs before
 * any of the app's own scripts on every navigation. This keeps feature specs
 * fast and focused - `tests/auth/login.spec.ts` is what actually drives the
 * login form.
 */

export type LoginUser = {
  id: string
  username: string
  role: 'admin' | 'driver'
  driverId: string
  name: string
}

const ADMIN_USER: LoginUser = {
  id: 'user-admin-1',
  username: 'admin',
  role: 'admin',
  driverId: '',
  name: 'Ava Admin',
}

const DRIVER_USER: LoginUser = {
  id: 'user-driver-1',
  username: 'john_driver',
  role: 'driver',
  driverId: 'drv-1',
  name: 'John Doe',
}

function logBrowserErrors(page: Page) {
  if (!process.env.CI) return

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[browser:${msg.type()}] ${msg.text()}`)
    }
  })
  page.on('pageerror', (err) => {
    console.log(`[browser:uncaught] ${err.stack || err.message}`)
  })
  page.on('requestfailed', (req) => {
    console.log(
      `[browser:requestfailed] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`,
    )
  })
}

async function seedAuth(page: Page, user: LoginUser, token: string) {
  logBrowserErrors(page)

  await page.addInitScript(
    ({ user, token }: { user: LoginUser; token: string }) => {
      window.localStorage.setItem('access_token', token)
      window.localStorage.setItem(
        'auth-store',
        JSON.stringify({ state: { user }, version: 0 }),
      )
    },
    { user, token },
  )
}

export async function loginAsAdmin(page: Page, user: LoginUser = ADMIN_USER) {
  await seedAuth(page, user, 'mock-admin-token')
}

export async function loginAsDriver(page: Page, user: LoginUser = DRIVER_USER) {
  await seedAuth(page, user, 'mock-driver-token')
}
