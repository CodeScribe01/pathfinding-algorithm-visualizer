import { forEachNeighbor, reconstructPath, createResult, toPoint } from './utils.js'

/**
 * Bidirectional BFS.
 *
 * Runs two breadth-first searches at once — one from the start, one from the
 * target — and stops as soon as the frontiers touch. Because each search only
 * has to reach depth d/2, the explored area shrinks from O(b^d) to
 * O(2 * b^(d/2)); on an open board that is a dramatic reduction in visited
 * nodes for the same optimal path.
 *
 * Expansion is level-synchronous and always grows the *smaller* frontier, which
 * keeps the two searches balanced. Like plain BFS it optimises edge count, so
 * on a weighted board its path is shortest in steps but not necessarily
 * cheapest in cost.
 *
 * Time  O(b^(d/2))   Space  O(b^(d/2))
 */
export function bidirectionalBfs(grid, source, target) {
  const { rows, cols, weights } = grid
  const total = rows * cols

  const prevForward = new Int32Array(total).fill(-1)
  const prevBackward = new Int32Array(total).fill(-1)
  const seenForward = new Uint8Array(total)
  const seenBackward = new Uint8Array(total)

  let frontierForward = [source]
  let frontierBackward = [target]
  seenForward[source] = 1
  seenBackward[target] = 1

  const visitedOrder = []
  let maxFrontier = 2
  let operations = 0
  let meetingPoint = source === target ? source : -1

  while (meetingPoint === -1 && frontierForward.length > 0 && frontierBackward.length > 0) {
    // Always expand the cheaper side so neither search runs away from the other.
    const expandForward = frontierForward.length <= frontierBackward.length
    const frontier = expandForward ? frontierForward : frontierBackward
    const seen = expandForward ? seenForward : seenBackward
    const seenOther = expandForward ? seenBackward : seenForward
    const prev = expandForward ? prevForward : prevBackward
    const side = expandForward ? 0 : 1
    const nextFrontier = []

    const combined = frontierForward.length + frontierBackward.length
    if (combined > maxFrontier) maxFrontier = combined

    for (let i = 0; i < frontier.length && meetingPoint === -1; i += 1) {
      const node = frontier[i]
      const point = toPoint(cols, node)
      visitedOrder.push({ row: point.row, col: point.col, frontierSize: combined, side })

      forEachNeighbor(grid, node, (neighbor) => {
        operations += 1
        if (seen[neighbor]) return
        seen[neighbor] = 1
        prev[neighbor] = node
        nextFrontier.push(neighbor)
        if (seenOther[neighbor] && meetingPoint === -1) meetingPoint = neighbor
      })
    }

    if (expandForward) frontierForward = nextFrontier
    else frontierBackward = nextFrontier
  }

  let path = []
  if (meetingPoint !== -1) {
    // Stitch the two half paths: source -> meeting point, then meeting point -> target.
    const forwardHalf = reconstructPath(prevForward, source, meetingPoint, cols)
    const backwardHalf = reconstructPath(prevBackward, target, meetingPoint, cols).reverse().slice(1)
    path = forwardHalf.concat(backwardHalf)
  }

  return createResult({
    visitedOrder,
    path,
    weights,
    cols,
    maxFrontier,
    operations,
  })
}
