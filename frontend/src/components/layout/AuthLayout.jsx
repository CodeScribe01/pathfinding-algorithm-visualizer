import { Link } from 'react-router-dom'
import { Wordmark } from './Logo'

/** Centred shell for the sign-in and registration forms. */
export function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="surface-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="PathForge home">
            <Wordmark />
          </Link>
        </div>
        <div className="rounded-xl border border-hairline bg-panel p-6 shadow-pop">
          <h1 className="text-base font-semibold text-ink">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{description}</p>
          ) : null}
          <div className="mt-5">{children}</div>
        </div>
        {footer ? <div className="mt-4 text-center text-xs text-ink-faint">{footer}</div> : null}
      </div>
    </div>
  )
}

export default AuthLayout
