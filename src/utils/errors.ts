interface ApiErrorShape {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
  message?: string
}

function hasApiErrorShape(err: unknown): err is ApiErrorShape {
  return typeof err === 'object' && err !== null
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (hasApiErrorShape(err)) {
    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      fallback
    )
  }
  return fallback
}
