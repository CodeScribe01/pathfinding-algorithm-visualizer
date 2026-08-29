import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, History, LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { buttonStyles } from '@/components/ui'

const initialsOf = (name = '') =>
  name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U'

export function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5">
        <Link to="/login" className={buttonStyles({ variant: 'ghost', size: 'sm' })}>
          Sign in
        </Link>
        <Link to="/register" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
          Create account
        </Link>
      </div>
    )
  }

  const handleSignOut = async () => {
    setOpen(false)
    await logout()
    toast.success('Signed out')
    navigate('/')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 items-center gap-2 rounded-md border border-hairline bg-elevated pl-1 pr-2 transition-colors hover:border-hairline-strong"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/20 font-mono text-[10px] font-semibold text-accent-soft">
          {initialsOf(user?.username)}
        </span>
        <span className="hidden max-w-[9rem] truncate text-xs text-ink-muted sm:block">
          {user?.username}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-lg border border-hairline bg-panel shadow-pop"
        >
          <div className="border-b border-hairline px-3 py-2.5">
            <p className="truncate text-xs font-medium text-ink">{user?.username}</p>
            <p className="truncate text-2xs text-ink-faint">{user?.email}</p>
          </div>
          <div className="p-1">
            <Link
              to="/history"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <History className="h-3.5 w-3.5" aria-hidden />
              Run history
            </Link>
            <Link
              to="/analytics"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              Analytics
            </Link>
            <Link
              to="/grids"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <User className="h-3.5 w-3.5" aria-hidden />
              Saved boards
            </Link>
          </div>
          <div className="border-t border-hairline p-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-elevated hover:text-rose-300"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default UserMenu
