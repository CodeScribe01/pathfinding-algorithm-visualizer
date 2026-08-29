import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

/** Error surface for failed API calls, with an explicit retry affordance. */
export function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  const message =
    error?.isNetwork
      ? 'Cannot reach the PathForge API. Start the Django server, then retry.'
      : error?.message || 'Unexpected error.'

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10">
        <AlertTriangle className="h-4 w-4 text-rose-400" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="text-xs leading-relaxed text-ink-faint">{message}</p>
      </div>
      {onRetry ? (
        <Button size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}

export default ErrorState
