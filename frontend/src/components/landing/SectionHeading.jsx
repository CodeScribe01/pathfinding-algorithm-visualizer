import { cn } from '@/lib/cn'

export function SectionHeading({ eyebrow, title, description, className, align = 'left' }) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? <p className="label-caps mb-3">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{description}</p>
      ) : null}
    </div>
  )
}

export default SectionHeading
