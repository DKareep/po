// Manual mock for `sonner`. Rendering the real Toaster in jsdom needs
// ResizeObserver/animation polyfills for no real benefit here — tests assert
// on `toast.<method>` calls instead, which is the component's actual
// contract with the notification layer.
const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  message: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}

function Toaster() {
  return null
}

module.exports = { toast, Toaster }
