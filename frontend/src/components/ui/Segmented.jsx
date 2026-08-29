import { cn } from '@/lib/cn'
import { Tooltip } from './Tooltip'

/**
 * Segmented control used for tools and playback speed.
 * Rendered as a radiogroup so arrow-key navigation and screen readers work.
 */
export function Segmented({ label, options, value, onChange, className, size = 'md' }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? <span className="label-caps">{label}</span> : null}
      <div
        role="radiogroup"
        aria-label={label}
        className="flex items-center gap-0.5 rounded-md border border-hairline bg-elevated p-0.5"
      >
        {options.map((option) => {
          const active = option.value === value
          const Icon = option.icon
          const button = (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={option.label}
              onClick={() => onChange?.(option.value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-[5px] font-medium transition-colors',
                size === 'sm' ? 'h-6 px-1.5 text-2xs' : 'h-7 px-2 text-xs',
                active
                  ? 'bg-raised text-ink shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]'
                  : 'text-ink-faint hover:text-ink-muted',
              )}
            >
              {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
              {option.showLabel === false ? null : option.label}
            </button>
          )

          return option.tooltip ? (
            <Tooltip key={option.value} label={option.tooltip} shortcut={option.shortcut} className="flex-1">
              {button}
            </Tooltip>
          ) : (
            button
          )
        })}
      </div>
    </div>
  )
}

export default Segmented
