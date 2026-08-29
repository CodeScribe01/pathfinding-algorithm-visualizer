import { useEffect, useMemo, useRef, useState } from 'react'
import { runAlgorithm, getAlgorithmMeta } from '@/algorithms'
import { generateMaze } from '@/maze'
import { formatMs, formatNumber } from '@/lib/format'

const ROWS = 17
const COLS = 33
const SEQUENCE = ['bfs', 'astar', 'dijkstra', 'bidirectional']

/** Deterministic PRNG so the marketing board looks identical on every load. */
const mulberry32 = (seed) => () => {
  let t = (seed += 0x6d2b79f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const START = { row: 9, col: 3 }
const TARGET = { row: 7, col: 29 }

/**
 * Self-running preview of the real product: it calls the same algorithm
 * modules, on a real generated maze, and cycles through four searches.
 * Nothing here is a mockup.
 */
export function HeroBoard() {
  const cellsRef = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [stats, setStats] = useState(null)

  const { walls, weights } = useMemo(() => {
    const rng = mulberry32(20240517)
    const source = START.row * COLS + START.col
    const target = TARGET.row * COLS + TARGET.col
    const generated = generateMaze('division', { rows: ROWS, cols: COLS, source, target, rng })
    return { walls: generated, weights: new Uint8Array(ROWS * COLS).fill(1) }
  }, [])

  const runs = useMemo(
    () =>
      SEQUENCE.map((id) =>
        runAlgorithm(
          id,
          { rows: ROWS, cols: COLS, walls, weights },
          START.row * COLS + START.col,
          TARGET.row * COLS + TARGET.col,
        ),
      ),
    [walls, weights],
  )

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let timer = 0
    let cancelled = false

    const clear = () => {
      cellsRef.current.forEach((element, index) => {
        if (!element) return
        const isStart = index === START.row * COLS + START.col
        const isTarget = index === TARGET.row * COLS + TARGET.col
        element.dataset.state = isStart
          ? 'start'
          : isTarget
            ? 'target'
            : walls[index]
              ? 'wall'
              : 'empty'
      })
    }

    const paint = (node, state) => {
      const element = cellsRef.current[node.row * COLS + node.col]
      if (!element || element.dataset.fixed === '1') return
      element.dataset.state = state
    }

    const playRun = (index) => {
      if (cancelled) return
      const result = runs[index]
      setActiveIndex(index)
      setStats(result)
      clear()

      if (prefersReducedMotion) {
        result.visitedOrder.forEach((step) => paint(step, 'visited'))
        result.path.forEach((step) => paint(step, 'path'))
        timer = window.setTimeout(() => playRun((index + 1) % runs.length), 5000)
        return
      }

      let visitedCursor = 0
      let pathCursor = 0

      const tick = () => {
        if (cancelled) return
        for (let i = 0; i < 9 && visitedCursor < result.visitedOrder.length; i += 1) {
          const step = result.visitedOrder[visitedCursor]
          visitedCursor += 1
          paint(step, step.side === 1 ? 'visited-alt' : 'visited')
        }
        if (visitedCursor >= result.visitedOrder.length) {
          if (pathCursor < result.path.length) {
            paint(result.path[pathCursor], 'path')
            pathCursor += 1
          } else {
            timer = window.setTimeout(() => playRun((index + 1) % runs.length), 2200)
            return
          }
        }
        frame = requestAnimationFrame(tick)
      }

      frame = requestAnimationFrame(tick)
    }

    playRun(0)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [runs, walls])

  const meta = getAlgorithmMeta(SEQUENCE[activeIndex])

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-panel shadow-pop">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
          <span className="h-2 w-2 rounded-full bg-hairline-strong" />
        </div>
        <span className="font-mono text-2xs text-ink-faint">
          {meta.shortName} · {ROWS}×{COLS} · recursive division
        </span>
      </div>

      <div
        className="grid border-l border-t border-hairline/60"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length: ROWS * COLS }, (_, index) => {
          const isStart = index === START.row * COLS + START.col
          const isTarget = index === TARGET.row * COLS + TARGET.col
          return (
            <div
              key={index}
              ref={(element) => {
                cellsRef.current[index] = element
              }}
              className="node"
              data-fixed={isStart || isTarget ? '1' : undefined}
              data-state={
                isStart ? 'start' : isTarget ? 'target' : walls[index] ? 'wall' : 'empty'
              }
            />
          )
        })}
      </div>

      <div className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline">
        {[
          { label: 'Visited', value: formatNumber(stats?.nodesVisited ?? 0) },
          { label: 'Path', value: formatNumber(stats?.pathLength ?? 0) },
          { label: 'Time', value: formatMs(stats?.executionTime ?? 0) },
        ].map((item) => (
          <div key={item.label} className="px-3 py-2">
            <p className="label-caps">{item.label}</p>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroBoard
