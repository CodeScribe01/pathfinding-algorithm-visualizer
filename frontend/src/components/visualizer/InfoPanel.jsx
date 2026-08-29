import { Link } from 'react-router-dom'
import { ArrowUpRight, Check, Minus } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatNumber } from '@/lib/format'
import { VISUALIZER_STATUS } from '@/lib/constants'

const STATUS_META = {
  [VISUALIZER_STATUS.IDLE]: { label: 'Idle', tone: 'neutral', dot: 'bg-ink-ghost' },
  [VISUALIZER_STATUS.COMPUTING]: { label: 'Computing', tone: 'info', dot: 'bg-cyan-400' },
  [VISUALIZER_STATUS.RUNNING]: { label: 'Running', tone: 'accent', dot: 'bg-accent-soft' },
  [VISUALIZER_STATUS.PAUSED]: { label: 'Paused', tone: 'warning', dot: 'bg-amber-400' },
  [VISUALIZER_STATUS.DONE]: { label: 'Complete', tone: 'success', dot: 'bg-emerald-400' },
}

function SpecRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-xs text-ink-faint">{label}</span>
      <span className="text-right text-xs font-medium text-ink">{children}</span>
    </div>
  )
}

function BooleanMark({ value, trueLabel = 'Yes', falseLabel = 'No' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        value ? 'text-emerald-400' : 'text-ink-muted',
      )}
    >
      {value ? <Check className="h-3 w-3" aria-hidden /> : <Minus className="h-3 w-3" aria-hidden />}
      {value ? trueLabel : falseLabel}
    </span>
  )
}

/**
 * Right rail: what the selected algorithm is, what it guarantees, and what the
 * engine is doing right now.
 */
export function InfoPanel({ algorithm, status, liveStats, result, className }) {
  const statusMeta = STATUS_META[status] ?? STATUS_META.idle
  const progress = Math.round((liveStats?.progress ?? 0) * 100)

  return (
    <div className={cn('flex h-full flex-col divide-y divide-hairline', className)}>
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">{algorithm.name}</h2>
            <p className="mt-0.5 font-mono text-2xs text-ink-faint">{algorithm.category}</p>
          </div>
          <span
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{ background: algorithm.accent }}
            aria-hidden
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">{algorithm.tagline}</p>
        <Link
          to={`/algorithms?focus=${algorithm.id}`}
          className="mt-3 inline-flex items-center gap-1 text-2xs font-medium text-accent-soft transition-colors hover:text-white"
        >
          Full breakdown
          <ArrowUpRight className="h-3 w-3" aria-hidden />
        </Link>
      </div>

      <div className="px-4 py-2">
        <div className="divide-y divide-hairline/70">
          <SpecRow label="Time complexity">
            <code className="font-mono text-accent-soft">{algorithm.timeComplexity}</code>
          </SpecRow>
          <SpecRow label="Space complexity">
            <code className="font-mono text-accent-soft">{algorithm.spaceComplexity}</code>
          </SpecRow>
          <SpecRow label="Data structure">{algorithm.dataStructure}</SpecRow>
          <SpecRow label="Handles weights">
            <BooleanMark value={algorithm.weighted} trueLabel="Yes" falseLabel="Ignores" />
          </SpecRow>
          <SpecRow label="Shortest path">
            <BooleanMark
              value={algorithm.guaranteesShortestPath}
              trueLabel="Guaranteed"
              falseLabel="Not guaranteed"
            />
          </SpecRow>
        </div>
        <p className="pb-3 pt-1 text-2xs leading-relaxed text-ink-ghost">
          {algorithm.optimalityNote}
        </p>
      </div>

      <div className="flex-1 px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="label-caps">Execution state</h3>
          <Badge tone={statusMeta.tone}>
            <span className={cn('h-1.5 w-1.5 rounded-full', statusMeta.dot)} aria-hidden />
            {statusMeta.label}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-2xs text-ink-faint">
              <span>Animation progress</span>
              <span className="font-mono tabular-nums">{progress}%</span>
            </div>
            <div
              className="h-1 overflow-hidden rounded-full bg-hairline-strong"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Animation progress"
            >
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-150 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-hairline bg-elevated px-2.5 py-2">
              <p className="label-caps">Frontier</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-ink">
                {formatNumber(liveStats?.frontier ?? 0)}
              </p>
              <p className="mt-0.5 text-2xs text-ink-ghost">nodes queued</p>
            </div>
            <div className="rounded-md border border-hairline bg-elevated px-2.5 py-2">
              <p className="label-caps">Expanded</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-ink">
                {formatNumber(liveStats?.visited ?? 0)}
              </p>
              <p className="mt-0.5 text-2xs text-ink-ghost">nodes dequeued</p>
            </div>
          </div>

          {result && status === VISUALIZER_STATUS.DONE ? (
            <div
              className={cn(
                'rounded-md border px-2.5 py-2 text-2xs leading-relaxed',
                result.found
                  ? 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-300'
                  : 'border-amber-500/25 bg-amber-500/[0.07] text-amber-300',
              )}
            >
              {result.found
                ? `Target reached after expanding ${formatNumber(result.nodesVisited)} nodes. Path uses ${formatNumber(result.pathLength)} steps at a cost of ${formatNumber(result.pathCost)}.`
                : 'No path exists between the start and target on this board. Every reachable node was expanded.'}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default InfoPanel
