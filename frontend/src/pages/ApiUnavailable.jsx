import { Link } from 'react-router-dom'
import { Database, Github } from 'lucide-react'
import { buttonStyles } from '@/components/ui'
import { GITHUB_URL } from '@/lib/constants'

/**
 * Shown in the static demo build for routes that need the Django API.
 * GitHub Pages hosts files only, so accounts, saved boards, run history and
 * analytics are unavailable there — this explains that rather than letting a
 * request fail silently against a backend that was never deployed.
 */
export default function ApiUnavailablePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-elevated">
        <Database className="h-4 w-4 text-ink-faint" aria-hidden="true" />
      </div>

      <p className="mt-4 font-mono text-2xs uppercase tracking-[0.2em] text-ink-ghost">
        Live demo
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
        This page needs the API
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        This deployment is the front end only. Accounts, saved boards, run history and analytics
        are served by a Django REST API backed by SQL Server, which needs a server to run on —
        GitHub Pages hosts static files.
      </p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-muted">
        Everything algorithmic works here: all six search algorithms, the four maze generators and
        the full comparison workspace run in your browser. Clone the repository to run the complete
        stack locally.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link to="/visualizer" className={buttonStyles({ variant: 'primary', size: 'md' })}>
          Open visualizer
        </Link>
        <Link to="/compare" className={buttonStyles({ variant: 'secondary', size: 'md' })}>
          Compare algorithms
        </Link>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer noopener"
          className={buttonStyles({ variant: 'ghost', size: 'md' })}
        >
          <Github className="h-3.5 w-3.5" aria-hidden="true" />
          Source and setup
        </a>
      </div>
    </div>
  )
}
