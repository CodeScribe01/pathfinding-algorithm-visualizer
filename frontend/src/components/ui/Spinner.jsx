import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Spinner({ className, label = 'Loading' }) {
  return (
    <span role="status" aria-label={label}>
      <Loader2 className={cn('h-4 w-4 animate-spin text-ink-faint', className)} aria-hidden />
    </span>
  )
}

export default Spinner
