import { forEachNeighbor, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * Breadth-First Search.
 *
 * Explores the graph in expanding "rings" using a FIFO queue, so the first time
 * a node is dequeued it has been reached through the fewest possible edges.
 * That makes BFS optimal for *unweighted* graphs — it minimises the number of
 * steps, not the accumulated weight.
 *
 * The queue is a fixed Int32Array ring (each node is enqueued at most once,
 * because nodes are marked as discovered on enqueue rather than on dequeue),
 * which avoids the O(n) cost of Array.prototype.shift().
 *
 * Time  O(V + E)   Space  O(V)
 */
export function bfs(grid, source, target) {
  const { rows, cols, weights } = grid
  const total = rows * cols

  const prev = new Int32Array(total).fill(-1)
  const discovered = new Uint8Array(total)
  const queue = new Int32Array(total)
  let head = 0
  let tail = 0

  const visitedOrder = []
  let maxFrontier = 0
  let operations = 0
  let reached = false

  discovered[source] = 1
  queue[tail] = source
  tail += 1

  while (head < tail) {
    const frontierSize = tail - head
    if (frontierSize > maxFrontier) maxFrontier = frontierSize

    const node = queue[head]
    head += 1

    const point = toPoint(cols, node)
    visitedOrder.push({ row: point.row, col: point.col, frontierSize })

    if (node === target) {
      reached = true
      break
    }

    forEachNeighbor(grid, node, (neighbor) => {
      operations += 1
      if (discovered[neighbor]) return
      discovered[neighbor] = 1
      prev[neighbor] = node
      queue[tail] = neighbor
      tail += 1
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
