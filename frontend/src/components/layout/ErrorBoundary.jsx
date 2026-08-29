import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

/**
 * Top-level crash guard. A render error in one route should show a recoverable
 * screen rather than a blank page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('PathForge crashed:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10">
          <AlertTriangle className="h-5 w-5 text-rose-400" aria-hidden />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-semibold text-ink">Something broke</h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            An unexpected error stopped the interface from rendering. Reloading usually clears it.
          </p>
          <p className="font-mono text-2xs text-ink-ghost">{this.state.error?.message}</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
        >
          Reload PathForge
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
