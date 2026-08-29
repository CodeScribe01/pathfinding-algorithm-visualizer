import { Link } from 'react-router-dom'
import { buttonStyles } from '@/components/ui'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-ink-ghost">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">No path to this route</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        The search terminated without reaching a target. Head back to a board that exists.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <Link to="/" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
          Home
        </Link>
        <Link to="/visualizer" className={buttonStyles({ variant: 'primary', size: 'md' })}>
          Open visualizer
        </Link>
      </div>
    </div>
  )
}
