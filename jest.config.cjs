/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/test/styleMock.cjs',
  },
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
}
