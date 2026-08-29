/**
 * Shared primitives for every search implementation.
 *
 * Graph representation
 * --------------------
 * The board is an implicit graph: every walkable cell is a vertex and edges
 * connect 4-adjacent cells. Instead of materialising an adjacency list (which
 * would cost O(V + E) memory and a lot of allocation churn) we keep the grid in
 * flat typed arrays and derive neighbours arithmetically. Node ids are plain
 * integers: `id = row * cols + col`.
 *
 * Edge weights are *node entry costs*: moving into cell `n` costs `weights[n]`
 * (1 for a normal cell, WEIGHT_COST for a weighted cell). This keeps the model
 * simple while still producing a genuinely weighted graph for Dijkstra/A*.
 */

/** Movement offsets: North, East, South, West (no diagonals). */
export const DIRECTIONS = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
]

/** Cost of stepping onto a weighted cell. */
export const WEIGHT_COST = 5

export const toIndex = (cols, row, col) => row * cols + col
export const toRow = (cols, index) => Math.trunc(index / cols)
export const toCol = (cols, index) => index % cols

/** Convert a node id into the `{ row, col }` shape consumed by the UI. */
export const toPoint = (cols, index) => ({ row: Math.trunc(index / cols), col: index % cols })

/**
 * Invoke `visit(neighbourId, neighbourRow, neighbourCol)` for every in-bounds,
 * non-wall neighbour of `index`.
 */
export function forEachNeighbor({ rows, cols, walls }, index, visit) {
  const row = Math.trunc(index / cols)
  const col = index % cols
  for (let d = 0; d < DIRECTIONS.length; d += 1) {
    const nr = row + DIRECTIONS[d][0]
    const nc = col + DIRECTIONS[d][1]
    if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue
    const nIndex = nr * cols + nc
    if (walls[nIndex]) continue
    visit(nIndex, nr, nc)
  }
}

/**
 * Walk the predecessor array backwards from `target` to the root and return the
 * path in forward order. Returns an empty array when the target was never
 * reached (`prev[target] === -1` and target is not the root).
 */
export function reconstructPath(prev, source, target, cols) {
  if (target !== source && prev[target] === -1) return []
  const path = []
  let cursor = target
  let guard = 0
  const limit = prev.length + 1
  while (cursor !== -1 && guard < limit) {
    path.push(toPoint(cols, cursor))
    if (cursor === source) break
    cursor = prev[cursor]
    guard += 1
  }
  return path.reverse()
}

/** Sum of entry costs along the path (the start cell is free). */
export function computePathCost(path, weights, cols) {
  let cost = 0
  for (let i = 1; i < path.length; i += 1) {
    cost += weights[path[i].row * cols + path[i].col]
  }
  return cost
}

/**
 * Normalised result envelope. Every algorithm returns exactly this shape so the
 * visualiser, the comparison page and the API layer stay decoupled from the
 * search internals.
 */
export function createResult({
  visitedOrder = [],
  path = [],
  weights,
  cols,
  maxFrontier = 0,
  operations = 0,
}) {
  const found = path.length > 0
  return {
    visitedOrder,
    path,
    pathCost: found ? computePathCost(path, weights, cols) : 0,
    pathLength: found ? path.length - 1 : 0,
    nodesVisited: visitedOrder.length,
    maxFrontier,
    operations,
    found,
    executionTime: 0, // stamped by runAlgorithm()
  }
}
