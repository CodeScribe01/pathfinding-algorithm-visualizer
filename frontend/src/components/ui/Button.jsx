import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  primary:
    'bg-accent text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset] hover:bg-accent-soft active:bg-accent disabled:hover:bg-accent',
  secondary:
    'border border-hairline bg-elevated text-ink hover:border-hairline-strong hover:bg-raised',
  ghost: 'text-ink-muted hover:bg-elevated hover:text-ink',
  danger:
    'border border-rose-500/25 bg-rose-500/10 text-rose-300 hover:border-rose-500/40 hover:bg-rose-500/15',
  subtle: 'bg-accent/10 text-accent-soft hover:bg-accent/15',
}

const SIZES = {
  xs: 'h-7 gap-1.5 rounded-md px-2 text-2xs',
  sm: 'h-8 gap-1.5 rounded-md px-2.5 text-xs',
  md: 'h-9 gap-2 rounded-md px-3 text-sm',
  lg: 'h-11 gap-2 rounded-lg px-5 text-sm',
  icon: 'h-8 w-8 rounded-md',
}

export const buttonStyles = ({ variant = 'secondary', size = 'md', className } = {}) =>
  cn(
    'inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    className,
  )

/** Base button. Anchors and router links reuse `buttonStyles` directly. */
export const Button = forwardRef(function Button(
  { variant = 'secondary', size = 'md', className, children, loading = false, icon: Icon, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : Icon ? (
        <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden />
      ) : null}
      {children}
    </button>
  )
})

export default Button
