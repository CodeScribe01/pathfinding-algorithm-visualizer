import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const TONES = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  info: 'text-accent-soft',
}

/** Lightweight toast host — no popups, just a corner stack that self-dismisses. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (message, { tone = 'info', duration = 4000, description } = {}) => {
      idRef.current += 1
      const id = idRef.current
      setToasts((current) => [...current.slice(-2), { id, message, description, tone }])
      if (duration > 0) window.setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      toast: push,
      success: (message, options) => push(message, { ...options, tone: 'success' }),
      error: (message, options) => push(message, { ...options, tone: 'error', duration: 6000 }),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.tone] ?? Info
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex items-start gap-3 rounded-card border border-hairline bg-elevated/95 p-3 shadow-pop backdrop-blur"
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', TONES[toast.tone])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{toast.message}</p>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs text-ink-muted">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded p-0.5 text-ink-ghost transition-colors hover:text-ink"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
