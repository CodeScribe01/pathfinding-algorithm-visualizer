import { Crosshair, Route, Timer } from 'lucide-react'
import { formatMs, formatNumber } from '@/lib/format'

const pickWinner = (rows, key) =>
  rows.reduce((best, row) => (best === null || row[key] < best[key] ? row : best), null)

/**
 * Plain-language read-out of who won what. Only runs that found a path are
 * eligible, so "cheapest path" can never be awarded to a failed search.
 */
export function VerdictSummary({ rows }) {
  const solved = rows.filter((row) => row.found)
  if (solved.length === 0) return null

  const leanest = pickWinner(solved, 'nodesVisited')
  const cheapest = pickWinner(solved, 'pathCost')
  const fastest = pickWinner(solved, 'executionTime')

  const cards = [
    {
      icon: Crosshair,
      label: 'Fewest expansions',
      winner: leanest,
      detail: `${formatNumber(leanest.nodesVisited)} nodes visited`,
      why: 'Explored the smallest fraction of the board to reach the target.',
    },
    {
      icon: Route,
      label: 'Cheapest path',
      winner: cheapest,
      detail: `cost ${formatNumber(cheapest.pathCost)} over ${formatNumber(cheapest.pathLength)} steps`,
      why: 'Returned the lowest total entry cost across the route.',
    },
    {
      icon: Timer,
      label: 'Fastest search',
      winner: fastest,
      detail: formatMs(fastest.executionTime),
      why: 'Wall-clock time for the search itself, animation excluded.',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-card border border-hairline bg-panel p-4">
          <div className="flex items-center gap-1.5">
            <card.icon className="h-3 w-3 text-ink-ghost" aria-hidden />
            <span className="label-caps">{card.label}</span>
          </div>
          <p className="mt-2.5 flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: card.winner.accent }}
              aria-hidden
            />
            <span className="text-sm font-semibold text-ink">{card.winner.name}</span>
          </p>
          <p className="mt-1 font-mono text-2xs text-accent-soft">{card.detail}</p>
          <p className="mt-2 text-2xs leading-relaxed text-ink-faint">{card.why}</p>
        </div>
      ))}
    </div>
  )
}

export default VerdictSummary
