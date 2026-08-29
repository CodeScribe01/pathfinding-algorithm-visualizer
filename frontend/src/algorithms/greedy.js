import { MinHeap } from './MinHeap.js'
import { getHeuristic, DEFAULT_HEURISTIC } from './heuristics.js'
import { forEachNeighbor, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * Greedy Best-First Search.
 *
 * Identical machinery to A*, but the priority is h(n) alone — the cost already
 * paid is ignored. That makes it fast and aggressively goal-directed, and also
 * makes it non-optimal: it commits to whichever corridor points at the target
 * and pays for the detour later.
 *
 * Time  O((V + E) log V)   Space  O(V)
 */
export function greedyBestFirst(grid, source, target, options = {}) {
  const { rows, cols, weights } = grid
  const total = rows * cols
  const heuristic = getHeuristic(options.heuristic ?? DEFAULT_HEURISTIC)

  const targetRow = Math.trunc(target / cols)
  const targetCol = target % cols

  const prev = new Int32Array(total).fill(-1)
  const discovered = new Uint8Array(total)
  const expanded = new Uint8Array(total)
  const heap = new MinHeap(Math.max(64, total >> 2))

  const visitedOrder = []
  let maxFrontier = 0
  let operations = 0
  let reached = false

  discovered[source] = 1
  heap.push(source, heuristic(Math.trunc(source / cols), source % cols, targetRow, targetCol))

  while (!heap.isEmpty) {
    if (heap.size > maxFrontier) maxFrontier = heap.size
    const frontierSize = heap.size
    const node = heap.pop()
    if (expanded[node]) continue
    expanded[node] = 1

    const point = toPoint(cols, node)
    visitedOrder.push({ row: point.row, col: point.col, frontierSize })

    if (node === target) {
      reached = true
      break
    }

    forEachNeighbor(grid, node, (neighbor, nr, nc) => {
      operations += 1
      if (discovered[neighbor]) return
      discovered[neighbor] = 1
      prev[neighbor] = node
      heap.push(neighbor, heuristic(nr, nc, targetRow, targetCol))
    })
  }

  return createResult({
    visitedOrder,
    path: reached ? reconstructPath(prev, source, target, cols) : [],
    weights,
    cols,
    maxFrontier,
    operations,
  })
}
