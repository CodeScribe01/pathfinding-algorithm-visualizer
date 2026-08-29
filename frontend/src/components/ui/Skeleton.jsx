import { cn } from '@/lib/cn'

/** Shimmer placeholder for list and chart loading states. */
export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-elevated', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  )
}

export default Skeleton
