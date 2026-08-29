import { MinHeap } from './MinHeap.js'
import { forEachNeighbor, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * Dijkstra's algorithm.
 *
 * Greedily finalises the unvisited node with the smallest tentative distance,
 * which is safe because all edge weights are non-negative. Uses the hand-rolled
 * binary MinHeap with lazy deletion: relaxing an edge pushes a new entry rather
 * than decreasing a key, and stale entries are discarded when popped.
 *
 * Optimal for weighted graphs — it minimises accumulated path *cost*, which is
 * exactly where it diverges from BFS once weighted cells are painted.
 *
 * Time  O((V + E) log V)   Space  O(V)
 */
export function dijkstra(grid, source, target) {
  const { rows, cols, weights } = grid
  const total = rows * cols

  const dist = new Float64Array(total).fill(Infinity)
  const prev = new Int32Array(total).fill(-1)
  const finalized = new Uint8Array(total)
  const heap = new MinHeap(Math.max(64, total >> 2))

  const visitedOrder = []
  let maxFrontier = 0
  let operations = 0
  let reached = false

  dist[source] = 0
  heap.push(source, 0)

  while (!heap.isEmpty) {
    if (heap.size > maxFrontier) maxFrontier = heap.size
    const frontierSize = heap.size
    const node = heap.pop()
    if (finalized[node]) continue // stale heap entry left behind by lazy deletion
    finalized[node] = 1

    const point = toPoint(cols, node)
    visitedOrder.push({ row: point.row, col: point.col, frontierSize })

    if (node === target) {
      reached = true
      break
    }

    forEachNeighbor(grid, node, (neighbor) => {
      operations += 1
      if (finalized[neighbor]) return
      const candidate = dist[node] + weights[neighbor]
      if (candidate < dist[neighbor]) {
        dist[neighbor] = candidate
        prev[neighbor] = node
        heap.push(neighbor, candidate)
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
