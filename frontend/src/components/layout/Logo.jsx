import { cn } from '@/lib/cn'

/** PathForge mark: three nodes and the path that threads them. */
export function Logo({ className, size = 20 }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="7" className="fill-elevated" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="7"
        fill="none"
        className="stroke-hairline-strong"
        strokeWidth="1.5"
      />
      <path
        d="M9 12v4h7v4h7"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="6" y="6" width="6" height="6" rx="1.6" fill="#10b981" />
      <rect x="13" y="13" width="6" height="6" rx="1.6" fill="#6366f1" />
      <rect x="20" y="20" width="6" height="6" rx="1.6" fill="#f43f5e" />
    </svg>
  )
}

export function Wordmark({ className }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Logo />
      <span className="text-[15px] font-semibold tracking-tight text-ink">PathForge</span>
    </span>
  )
}

export default Logo
