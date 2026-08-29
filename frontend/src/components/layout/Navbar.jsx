import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Github, Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { GITHUB_URL } from '@/lib/constants'
import { Tooltip } from '@/components/ui'
import { Wordmark } from './Logo'
import { UserMenu } from './UserMenu'

const NAV_LINKS = [
  { to: '/visualizer', label: 'Visualizer' },
  { to: '/algorithms', label: 'Algorithms' },
  { to: '/compare', label: 'Compare' },
  { to: '/history', label: 'History' },
  { to: '/analytics', label: 'Analytics' },
]

const linkClass = ({ isActive }) =>
  cn(
    'rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors',
    isActive ? 'bg-elevated text-ink' : 'text-ink-faint hover:text-ink-muted',
  )

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="rounded-md" aria-label="PathForge home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip label="View source on GitHub">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub repository"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-elevated text-ink-faint transition-colors hover:border-hairline-strong hover:text-ink"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </Tooltip>

          <div className="hidden sm:block">
            <UserMenu />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-elevated text-ink-muted md:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-hairline bg-panel px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2.5 py-2 text-sm',
                    isActive ? 'bg-elevated text-ink' : 'text-ink-muted',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 border-t border-hairline pt-3 sm:hidden">
            <UserMenu key={location.pathname} />
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
