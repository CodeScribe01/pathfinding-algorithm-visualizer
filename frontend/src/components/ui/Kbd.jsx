import { cn } from '@/lib/cn'

/** Keyboard hint chip used in tooltips and the shortcut legend. */
export function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-hairline-strong bg-raised px-1 font-mono text-[10px] font-medium text-ink-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

export default Kbd
