import { cn } from '@/lib/cn'

/** Shared empty state — used wherever the API legitimately has no data yet. */
export function EmptyState({ icon: Icon, title, description, action, className, compact = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-6 py-10' : 'gap-3 px-6 py-16',
        className,
      )}
    >
      {Icon ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline bg-elevated">
          <Icon className="h-4 w-4 text-ink-faint" aria-hidden />
        </div>
      ) : null}
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-ink-faint">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export default EmptyState
