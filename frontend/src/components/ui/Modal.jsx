import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Accessible dialog: portalled, Escape-dismissable, backdrop click closes,
 * focus moves in on open and returns to the trigger on close, and body scroll
 * is locked while it is open.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    previouslyFocused.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)

    const timer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector(
        'input, textarea, select, button:not([data-close])',
      )
      ;(focusable ?? panelRef.current)?.focus()
    }, 30)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
      document.body.style.overflow = overflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative w-full rounded-xl border border-hairline bg-panel shadow-pop',
              size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md',
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">{title}</h2>
                {description ? (
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                data-close
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 -mt-1 rounded-md p-1 text-ink-ghost transition-colors hover:bg-elevated hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer ? (
              <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export default Modal
