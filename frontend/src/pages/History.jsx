import { useCallback, useMemo, useState } from 'react'
import { History as HistoryIcon, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageHeader,
  Select,
  Skeleton,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { useToast } from '@/context/ToastContext'
import { runsService } from '@/services'
import { ALGORITHM_LIST, getAlgorithmMeta } from '@/algorithms'
import { formatMs, formatNumber, formatRelative } from '@/lib/format'

const FILTER_OPTIONS = [
  { value: '', label: 'All algorithms' },
  ...ALGORITHM_LIST.map((algorithm) => ({ value: algorithm.id, label: algorithm.name })),
]

/** Persisted run history for the signed-in user. */
export default function HistoryPage() {
  const toast = useToast()
  const [algorithm, setAlgorithm] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchRuns = useCallback(() => runsService.list({ algorithm }), [algorithm])
  const { data, loading, error, execute, setData } = useAsync(fetchRuns, [algorithm])

  const runs = useMemo(() => data?.results ?? (Array.isArray(data) ? data : []), [data])

  const handleDelete = async () => {
    await runsService.remove(pendingDelete.id)
    // The API may be paginated or plain — keep whichever shape came back.
    const remaining = runs.filter((run) => run.id !== pendingDelete.id)
    setData(Array.isArray(data) ? remaining : { ...data, results: remaining })
    toast.success('Run deleted')
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Account"
        title="Run history"
        description="Every visualisation you run while signed in is recorded here with the board size, the metrics it produced and when it happened."
        actions={
          <Select
            options={FILTER_OPTIONS}
            value={algorithm}
            onChange={setAlgorithm}
            aria-label="Filter by algorithm"
            className="w-56"
          />
        }
      />

      <Card className="mt-6 overflow-hidden">
        <CardHeader
          title="Recorded runs"
          description={runs.length > 0 ? `${formatNumber(runs.length)} runs` : undefined}
        />

        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={execute} />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No runs recorded yet"
            description="Run a visualisation and it will appear here automatically. Nothing is pre-populated — this list only ever shows searches you actually executed."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-hairline text-2xs uppercase tracking-wider text-ink-ghost">
                  <th scope="col" className="px-4 py-2.5 font-medium">Algorithm</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Board</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Visited</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Path</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Cost</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Time</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">When</th>
                  <th scope="col" className="px-4 py-2.5" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {runs.map((run) => {
                  const meta = getAlgorithmMeta(run.algorithm)
                  return (
                    <tr key={run.id} className="text-xs transition-colors hover:bg-elevated/60">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: meta.accent }}
                            aria-hidden
                          />
                          <span className="font-medium text-ink">{meta.shortName}</span>
                          {!run.path_found ? <Badge tone="warning">no path</Badge> : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-muted">
                        {run.grid_rows}×{run.grid_columns}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-ink-muted">
                        {formatNumber(run.nodes_visited)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-ink-muted">
                        {formatNumber(run.path_length)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-ink-muted">
                        {formatNumber(run.path_cost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-ink-muted">
                        {formatMs(Number(run.execution_time))}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-faint">
                        {formatRelative(run.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${meta.shortName} run`}
                          onClick={() => setPendingDelete(run)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Delete this run?"
        description="It will be removed from your history and from the analytics aggregates."
      />
    </div>
  )
}
