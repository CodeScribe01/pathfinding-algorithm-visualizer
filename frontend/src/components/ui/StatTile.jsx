import { cn } from '@/lib/cn'

/**
 * Single metric readout. Values use tabular figures so the number does not
 * jitter while the search animates.
 */
export function StatTile({ label, value, unit, icon: Icon, tone = 'default', hint, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-md border border-hairline bg-panel px-3 py-2.5',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 text-ink-ghost" aria-hidden /> : null}
        <span className="label-caps">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-mono text-lg font-semibold tabular-nums leading-none',
            tone === 'accent' ? 'text-accent-soft' : tone === 'path' ? 'text-node-path' : 'text-ink',
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-2xs text-ink-faint">{unit}</span> : null}
      </div>
      {hint ? <span className="text-2xs text-ink-ghost">{hint}</span> : null}
    </div>
  )
}

export default StatTile
