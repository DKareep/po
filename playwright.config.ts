import { defineConfig, devices } from '@playwright/test'

/**
 * All app API calls go through axios with `baseURL: import.meta.env.VITE_API_URL`.
 * We point that at the same origin the app is served from (see `env` below) so
 * requests stay same-origin in the browser - no CORS preflight to worry about -
 * and every request is intercepted/mocked in-test via `page.route`. No real
 * backend (po-backend) needs to be running for these tests.
 */
const PORT = 5173
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            // webGL support
            '--enable-unsafe-swiftshader',
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Same-origin API base so mocked routes never hit CORS restrictions.
      VITE_API_URL: `${BASE_URL}/api`,
    },
  },
})
