import { cn } from '@/lib/cn'

const TONES = {
  neutral: 'border-hairline bg-elevated text-ink-muted',
  accent: 'border-accent/25 bg-accent/10 text-accent-soft',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
  info: 'border-cyan-500/25 bg-cyan-500/10 text-cyan-300',
}

export function Badge({ tone = 'neutral', className, children, mono = false, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-2xs font-medium',
        mono && 'font-mono',
        TONES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
