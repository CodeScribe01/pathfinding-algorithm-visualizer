import { useMemo } from 'react'
import { runAlgorithm, getAlgorithmMeta } from '@/algorithms'
import { generateMaze } from '@/maze'
import { formatMs, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

const ROWS = 21
const COLS = 41
const IDS = ['bfs', 'dfs', 'dijkstra', 'astar']

const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/**
 * Real numbers, not screenshot numbers: this table executes the four searches
 * on a deterministic maze while the page renders. It is the same code path the
 * /compare route uses.
 */
export function ComparePreview() {
  const rows = useMemo(() => {
    const source = 10 * COLS + 3
    const target = 10 * COLS + 37
    const rng = mulberry32(981221)
    const walls = generateMaze('division', { rows: ROWS, cols: COLS, source, target, rng })
    const weights = new Uint8Array(ROWS * COLS).fill(1)

    const results = IDS.map((id) => ({
      meta: getAlgorithmMeta(id),
      result: runAlgorithm(id, { rows: ROWS, cols: COLS, walls, weights }, source, target),
    }))

    const fewestVisited = Math.min(...results.map((entry) => entry.result.nodesVisited))
    return results.map((entry) => ({
      ...entry,
      isLeanest: entry.result.nodesVisited === fewestVisited,
    }))
  }, [])

  return (
    <div className="overflow-hidden rounded-card border border-hairline bg-panel">
      <div className="border-b border-hairline px-4 py-2.5">
        <p className="font-mono text-2xs text-ink-faint">
          live output · 21×41 recursive division board
        </p>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-hairline text-2xs uppercase tracking-wider text-ink-ghost">
            <th className="px-4 py-2 font-medium">Algorithm</th>
            <th className="px-4 py-2 text-right font-medium">Visited</th>
            <th className="px-4 py-2 text-right font-medium">Path</th>
            <th className="px-4 py-2 text-right font-medium">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {rows.map(({ meta, result, isLeanest }) => (
            <tr key={meta.id} className="text-xs">
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: meta.accent }}
                    aria-hidden
                  />
                  <span className="font-medium text-ink">{meta.shortName}</span>
                </span>
              </td>
              <td
                className={cn(
                  'px-4 py-2.5 text-right font-mono tabular-nums',
                  isLeanest ? 'text-emerald-400' : 'text-ink-muted',
                )}
              >
                {formatNumber(result.nodesVisited)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink-muted">
                {formatNumber(result.pathLength)}
              </td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink-muted">
                {formatMs(result.executionTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparePreview
