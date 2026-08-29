import { MinHeap } from './MinHeap.js'
import { getHeuristic, DEFAULT_HEURISTIC } from './heuristics.js'
import { forEachNeighbor, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * A* search.
 *
 * Dijkstra plus a heuristic: nodes are ordered by f(n) = g(n) + h(n), where
 * g is the cost paid so far and h estimates the cost still to pay. With an
 * admissible and consistent heuristic (Manhattan distance on a 4-connected grid
 * where the cheapest step costs 1) A* returns the same optimal path as
 * Dijkstra while expanding a fraction of the nodes — the difference is obvious
 * both on the board and in the comparison charts.
 *
 * Time  O((V + E) log V)   Space  O(V)
 */
export function astar(grid, source, target, options = {}) {
  const { rows, cols, weights } = grid
  const total = rows * cols
  const heuristic = getHeuristic(options.heuristic ?? DEFAULT_HEURISTIC)

  const targetRow = Math.trunc(target / cols)
  const targetCol = target % cols

  const gScore = new Float64Array(total).fill(Infinity)
  const prev = new Int32Array(total).fill(-1)
  const finalized = new Uint8Array(total)
  const heap = new MinHeap(Math.max(64, total >> 2))

  const visitedOrder = []
  let maxFrontier = 0
  let operations = 0
  let reached = false

  gScore[source] = 0
  heap.push(source, heuristic(Math.trunc(source / cols), source % cols, targetRow, targetCol))

  while (!heap.isEmpty) {
    if (heap.size > maxFrontier) maxFrontier = heap.size
    const frontierSize = heap.size
    const node = heap.pop()
    if (finalized[node]) continue
    finalized[node] = 1

    const point = toPoint(cols, node)
    visitedOrder.push({ row: point.row, col: point.col, frontierSize })

    if (node === target) {
      reached = true
      break
    }

    forEachNeighbor(grid, node, (neighbor, nr, nc) => {
      operations += 1
      if (finalized[neighbor]) return
      const candidate = gScore[node] + weights[neighbor]
      if (candidate < gScore[neighbor]) {
        gScore[neighbor] = candidate
        prev[neighbor] = node
        heap.push(neighbor, candidate + heuristic(nr, nc, targetRow, targetCol))
      }
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
