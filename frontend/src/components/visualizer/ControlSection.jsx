import { cn } from '@/lib/cn'

/** Titled block inside the control panel — keeps spacing consistent. */
export function ControlSection({ title, children, className, action }) {
  return (
    <section className={cn('border-b border-hairline px-4 py-4 last:border-b-0', className)}>
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <h3 className="label-caps">{title}</h3>
          {action}
        </div>
      ) : null}
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export default ControlSection
