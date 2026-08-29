import { cn } from '@/lib/cn'

export function Card({ className, children, ...props }) {
  return (
    <section className={cn('panel shadow-panel', className)} {...props}>
      {children}
    </section>
  )
}

export function CardHeader({ title, description, actions, icon: Icon, className }) {
  return (
    <header className={cn('panel-header', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden /> : null}
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-ink-faint">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </header>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-4', className)}>{children}</div>
}

export default Card
