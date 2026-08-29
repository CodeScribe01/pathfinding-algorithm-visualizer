import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef(function Input(
  { label, error, hint, className, id: providedId, icon: Icon, ...props },
  ref,
) {
  const generatedId = useId()
  const id = providedId ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-ghost"
            aria-hidden
          />
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'h-9 w-full rounded-md border bg-elevated px-2.5 text-sm text-ink placeholder:text-ink-ghost',
            'transition-colors focus:border-accent/60',
            Icon && 'pl-8',
            error ? 'border-rose-500/50' : 'border-hairline hover:border-hairline-strong',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-2xs text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-2xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Input
