import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Badge, buttonStyles } from '@/components/ui'
import { PseudocodeBlock } from './PseudocodeBlock'
import { cn } from '@/lib/cn'

function Spec({ label, value, mono = false }) {
  return (
    <div className="rounded-md border border-hairline bg-elevated px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className={cn('mt-1 text-xs font-medium text-ink', mono && 'font-mono text-accent-soft')}>
        {value}
      </p>
    </div>
  )
}

/** Full reference card used on the /algorithms page. */
export function AlgorithmCard({ algorithm, highlighted = false }) {
  return (
    <article
      id={algorithm.id}
      className={cn(
        'scroll-mt-24 rounded-card border bg-panel transition-colors',
        highlighted ? 'border-accent/40 shadow-glow' : 'border-hairline',
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: algorithm.accent }}
              aria-hidden
            />
            <h2 className="text-base font-semibold tracking-tight text-ink">{algorithm.name}</h2>
            <Badge mono tone="neutral">
              {algorithm.shortName}
            </Badge>
          </div>
          <p className="mt-1.5 font-mono text-2xs text-ink-faint">{algorithm.category}</p>
        </div>

        <Link
          to={`/visualizer?algorithm=${algorithm.id}`}
          className={buttonStyles({ variant: 'primary', size: 'sm' })}
        >
          <Play className="h-3.5 w-3.5" aria-hidden />
          Try it
        </Link>
      </header>

      <div className="grid gap-5 px-5 py-5 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink-muted">{algorithm.description}</p>

          <div className="grid grid-cols-2 gap-2">
            <Spec label="Time complexity" value={algorithm.timeComplexity} mono />
            <Spec label="Space complexity" value={algorithm.spaceComplexity} mono />
            <Spec label="Data structure" value={algorithm.dataStructure} />
            <Spec
              label="Weighted graphs"
              value={algorithm.weighted ? 'Supported' : 'Ignores weights'}
            />
          </div>

          <div
            className={cn(
              'rounded-md border px-3 py-2.5',
              algorithm.guaranteesShortestPath
                ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                : 'border-amber-500/25 bg-amber-500/[0.06]',
            )}
          >
            <p className="label-caps">Shortest path guarantee</p>
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                algorithm.guaranteesShortestPath ? 'text-emerald-300' : 'text-amber-300',
              )}
            >
              {algorithm.guaranteesShortestPath ? 'Yes' : 'No'} — {algorithm.optimalityNote}
            </p>
          </div>

          <div>
            <p className="label-caps mb-2">Best use cases</p>
            <ul className="space-y-1.5">
              {algorithm.useCases.map((useCase) => (
                <li key={useCase} className="flex items-start gap-2 text-xs text-ink-muted">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-ghost"
                    aria-hidden
                  />
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <PseudocodeBlock code={algorithm.pseudocode} />
      </div>
    </article>
  )
}

export default AlgorithmCard
