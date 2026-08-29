import { Children, cloneElement, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/cn'

const PLACEMENTS = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
}

/**
 * Hover/focus tooltip.
 *
 * `aria-describedby` is cloned onto the child element rather than a wrapper, so
 * screen readers announce the hint when the control itself takes focus — and
 * the wrapper stays a plain flex box, letting `w-full` children stretch.
 */
export function Tooltip({ label, shortcut, children, placement = 'top', className }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  if (!label) return children

  const child = Children.only(children)
  const described = cloneElement(child, { 'aria-describedby': open ? id : undefined })

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {described}
      <AnimatePresence>
        {open ? (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className={cn(
              'pointer-events-none absolute z-50 flex items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline bg-raised px-2 py-1 text-2xs text-ink shadow-pop',
              PLACEMENTS[placement],
            )}
          >
            {label}
            {shortcut ? (
              <span className="font-mono text-[10px] text-ink-faint">{shortcut}</span>
            ) : null}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}

export default Tooltip
