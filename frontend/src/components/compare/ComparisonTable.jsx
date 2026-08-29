import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatMs, formatNumber } from '@/lib/format'

const COLUMNS = [
  { key: 'nodesVisited', label: 'Nodes visited', best: 'min', format: formatNumber },
  { key: 'pathLength', label: 'Path length', best: 'min', format: formatNumber },
  { key: 'pathCost', label: 'Path cost', best: 'min', format: formatNumber },
  { key: 'executionTime', label: 'Execution time', best: 'min', format: (v) => formatMs(v) },
  { key: 'maxFrontier', label: 'Peak frontier', best: 'min', format: formatNumber },
]

/**
 * Result table. Best value per column is highlighted; "best" only counts runs
 * that actually found a path, so a failed search cannot win on path length.
 */
export function ComparisonTable({ rows }) {
  const solved = rows.filter((row) => row.found)
  const bestByColumn = COLUMNS.reduce((acc, column) => {
    if (solved.length > 0) {
      acc[column.key] = Math.min(...solved.map((row) => row[column.key]))
    }
    return acc
  }, {})

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <caption className="sr-only">
          Comparison of the selected pathfinding algorithms on the current board
        </caption>
        <thead>
          <tr className="border-b border-hairline">
            <th scope="col" className="px-4 py-2.5 text-2xs font-medium uppercase tracking-wider text-ink-ghost">
              Algorithm
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-2.5 text-right text-2xs font-medium uppercase tracking-wider text-ink-ghost"
              >
                {column.label}
              </th>
            ))}
            <th scope="col" className="px-4 py-2.5 text-right text-2xs font-medium uppercase tracking-wider text-ink-ghost">
              Optimal
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-elevated/60">
              <th scope="row" className="px-4 py-3 text-left">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: row.accent }}
                    aria-hidden
                  />
                  <span className="text-xs font-medium text-ink">{row.name}</span>
                  {!row.found ? (
                    <span className="rounded border border-amber-500/25 bg-amber-500/10 px-1 text-[10px] text-amber-300">
                      no path
                    </span>
                  ) : null}
                </span>
              </th>
              {COLUMNS.map((column) => {
                const value = row[column.key]
                const isBest = row.found && bestByColumn[column.key] === value
                return (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3 text-right font-mono text-xs tabular-nums',
                      isBest ? 'font-semibold text-emerald-400' : 'text-ink-muted',
                    )}
                  >
                    {row.found || column.key === 'nodesVisited' || column.key === 'executionTime'
                      ? column.format(value)
                      : '—'}
                  </td>
                )
              })}
              <td className="px-4 py-3 text-right">
                {row.guaranteesShortestPath ? (
                  <Check className="ml-auto h-3.5 w-3.5 text-emerald-400" aria-label="Guaranteed" />
                ) : (
                  <Minus className="ml-auto h-3.5 w-3.5 text-ink-ghost" aria-label="Not guaranteed" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
