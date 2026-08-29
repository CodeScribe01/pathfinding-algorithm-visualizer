import { Link } from 'react-router-dom'
import { Activity, BarChart3, Clock, Sparkles, Timer, TrendingDown } from 'lucide-react'
import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatTile,
  buttonStyles,
} from '@/components/ui'
import { AlgorithmUsageChart, EfficiencyChart, ActivityChart } from '@/components/analytics/UsageCharts'
import { useAsync } from '@/hooks/useAsync'
import { statisticsService } from '@/services'
import { getAlgorithmMeta } from '@/algorithms'
import { formatMs, formatNumber, formatRelative } from '@/lib/format'

/**
 * Aggregate dashboard. Every number here is computed server-side from the
 * user's own runs — when there is no history the page says so instead of
 * inventing sample data.
 */
export default function AnalyticsPage() {
  const { data, loading, error, execute } = useAsync(() => statisticsService.fetch(), [])

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <PageHeader eyebrow="Account" title="Analytics" description="Aggregated across your runs." />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[86px]" />
          ))}
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-[280px]" />
          <Skeleton className="h-[280px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <PageHeader eyebrow="Account" title="Analytics" />
        <Card className="mt-6">
          <ErrorState error={error} onRetry={execute} />
        </Card>
      </div>
    )
  }

  const stats = data ?? {}
  const byAlgorithm = stats.by_algorithm ?? []
  const recent = stats.recent_runs ?? []
  const hasData = (stats.total_runs ?? 0) > 0

  const mostUsed = stats.most_used_algorithm
  const bestPerforming = stats.best_performing_algorithm

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Analytics"
        description="Aggregated from every run you have executed while signed in — usage, efficiency and timing across algorithms."
      />

      {!hasData ? (
        <Card className="mt-6">
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Analytics are built from your own runs. Visualise a search or two and this dashboard will fill in — nothing here is sample data."
            action={
              <Link to="/visualizer" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                Open the visualizer
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Total visualizations"
              value={formatNumber(stats.total_runs)}
              icon={Activity}
              hint="runs recorded"
            />
            <StatTile
              label="Most-used algorithm"
              value={mostUsed ? getAlgorithmMeta(mostUsed.algorithm).shortName : '—'}
              icon={Sparkles}
              tone="accent"
              hint={mostUsed ? `${formatNumber(mostUsed.count)} runs` : undefined}
            />
            <StatTile
              label="Avg nodes visited"
              value={formatNumber(Math.round(stats.average_nodes_visited ?? 0))}
              icon={TrendingDown}
              hint="per run"
            />
            <StatTile
              label="Avg execution time"
              value={formatMs(Number(stats.average_execution_time ?? 0))}
              icon={Timer}
              hint="search only"
            />
          </div>

          {bestPerforming ? (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: getAlgorithmMeta(bestPerforming.algorithm).accent }}
                    aria-hidden
                  />
                  <div>
                    <p className="label-caps">Best performing</p>
                    <p className="mt-1 text-sm font-semibold text-ink">
                      {getAlgorithmMeta(bestPerforming.algorithm).name}
                    </p>
                  </div>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-ink-muted">
                  Expands the fewest nodes on average —{' '}
                  <span className="font-mono text-accent-soft">
                    {formatNumber(Math.round(bestPerforming.average_nodes_visited ?? 0))}
                  </span>{' '}
                  per run across {formatNumber(bestPerforming.runs ?? 0)} recorded searches.
                </p>
              </div>
            </Card>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <AlgorithmUsageChart byAlgorithm={byAlgorithm} />
            <EfficiencyChart byAlgorithm={byAlgorithm} />
          </div>

          <ActivityChart runsPerDay={stats.runs_per_day} />

          <Card className="overflow-hidden">
            <CardHeader title="Recent visualizations" description="Your last ten runs" />
            {recent.length === 0 ? (
              <EmptyState compact title="Nothing recent" description="Run a search to populate this list." />
            ) : (
              <ul className="divide-y divide-hairline">
                {recent.map((run) => {
                  const meta = getAlgorithmMeta(run.algorithm)
                  return (
                    <li
                      key={run.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: meta.accent }}
                          aria-hidden
                        />
                        <span className="text-xs font-medium text-ink">{meta.shortName}</span>
                        <span className="font-mono text-2xs text-ink-faint">
                          {run.grid_rows}×{run.grid_columns}
                        </span>
                        {!run.path_found ? <Badge tone="warning">no path</Badge> : null}
                      </span>
                      <span className="flex items-center gap-4 font-mono text-2xs text-ink-faint">
                        <span>{formatNumber(run.nodes_visited)} visited</span>
                        <span>{formatMs(Number(run.execution_time))}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden />
                          {formatRelative(run.created_at)}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
