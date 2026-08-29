import { DIRECTIONS, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * Depth-First Search (iterative).
 *
 * Uses an explicit LIFO stack instead of recursion so that deep boards cannot
 * blow the JS call stack. Nodes are marked visited on *pop*, which means a node
 * can sit in the stack more than once; the duplicate is skipped when it comes
 * back up. Neighbours are pushed in reverse direction order so the exploration
 * order still reads N -> E -> S -> W.
 *
 * DFS finds *a* path, never necessarily a short one — it is included precisely
 * to make that contrast visible next to BFS.
 *
 * Time  O(V + E)   Space  O(V)
 */
export function dfs(grid, source, target) {
  const { rows, cols, walls, weights } = grid
  const total = rows * cols

  const prev = new Int32Array(total).fill(-1)
  const visited = new Uint8Array(total)
  const stack = [source]

  const visitedOrder = []
  let maxFrontier = 0
  let operations = 0
  let reached = false

  while (stack.length > 0) {
    if (stack.length > maxFrontier) maxFrontier = stack.length
    const frontierSize = stack.length
    const node = stack.pop()
    if (visited[node]) continue
    visited[node] = 1

    const point = toPoint(cols, node)
    visitedOrder.push({ row: point.row, col: point.col, frontierSize })

    if (node === target) {
      reached = true
      break
    }

    // Reverse iteration keeps the visual exploration order consistent with the
    // other algorithms even though a stack inverts insertion order.
    for (let d = DIRECTIONS.length - 1; d >= 0; d -= 1) {
      const nr = point.row + DIRECTIONS[d][0]
      const nc = point.col + DIRECTIONS[d][1]
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
      const neighbor = nr * cols + nc
      operations += 1
      if (walls[neighbor] || visited[neighbor]) continue
      prev[neighbor] = node
      stack.push(neighbor)
    }
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
