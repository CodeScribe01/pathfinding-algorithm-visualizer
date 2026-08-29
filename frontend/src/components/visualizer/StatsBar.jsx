import { Activity, Footprints, Gauge, Layers, Route, Timer } from 'lucide-react'
import { StatTile } from '@/components/ui'
import { formatMs, formatNumber } from '@/lib/format'

/**
 * Bottom metric rail. Live counters come from the animation engine while the
 * search plays; the final envelope replaces them once it completes.
 */
export function StatsBar({ result, liveStats, isAnimating }) {
  const visited = isAnimating ? liveStats.visited : (result?.nodesVisited ?? 0)
  const pathLength = isAnimating ? liveStats.pathPainted : (result?.pathLength ?? 0)

  const tiles = [
    {
      label: 'Nodes visited',
      value: formatNumber(visited),
      icon: Activity,
      hint: 'dequeued and expanded',
    },
    {
      label: 'Nodes explored',
      value: formatNumber(result?.operations ?? 0),
      icon: Layers,
      hint: 'edges relaxed',
    },
    {
      label: 'Path length',
      value: formatNumber(pathLength),
      icon: Footprints,
      hint: 'steps',
      tone: 'path',
    },
    {
      label: 'Path cost',
      value: formatNumber(result?.pathCost ?? 0),
      icon: Route,
      hint: 'weighted total',
      tone: 'path',
    },
    {
      label: 'Execution time',
      value: result ? formatMs(result.executionTime) : '—',
      icon: Timer,
      hint: 'search only, excludes animation',
    },
    {
      label: 'Peak frontier',
      value: formatNumber(result?.maxFrontier ?? 0),
      icon: Gauge,
      hint: 'max queue size',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <StatTile key={tile.label} {...tile} />
      ))}
    </div>
  )
}

export default StatsBar
