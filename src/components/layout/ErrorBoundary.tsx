import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-xl font-semibold">Something went wrong</h2>

            <p className="text-muted-foreground">
              Please refresh the page and try again.
            </p>

            <button
              className="rounded-md bg-primary px-4 py-2 text-white"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
