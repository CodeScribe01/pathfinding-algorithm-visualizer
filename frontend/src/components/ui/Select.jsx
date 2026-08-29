import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Native select with custom chrome. Native beats a custom listbox here: it is
 * keyboard accessible for free, works with screen readers, and behaves
 * correctly on touch devices.
 */
export const Select = forwardRef(function Select(
  { label, hint, options, value, onChange, className, disabled, id: providedId, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={id} className="label-caps">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={cn(
            'h-9 w-full appearance-none rounded-md border border-hairline bg-elevated pl-2.5 pr-8 text-sm text-ink',
            'transition-colors hover:border-hairline-strong focus:border-accent/60',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
      </div>
      {hint ? <p className="text-2xs leading-relaxed text-ink-faint">{hint}</p> : null}
    </div>
  )
})

export default Select
