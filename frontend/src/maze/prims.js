import { createWallField } from './mazeUtils.js'

/**
 * Randomised Prim's algorithm.
 *
 * Grows a single connected corridor tree from a seed cell. The "frontier" holds
 * lattice cells that are two steps away from the tree; one is picked uniformly
 * at random, connected back to the tree through the wall between them, and its
 * own neighbours join the frontier.
 *
 * Because growth is uniformly random rather than depth-first, Prim mazes have
 * many short dead ends and a low branching corridor structure — visually very
 * different from recursive backtracking, and a much harder board for DFS.
 *
 * Time  O(rows * cols)
 */
export function randomizedPrims({ rows, cols, rng = Math.random }) {
  const walls = createWallField(rows, cols, true)
  const index = (r, c) => r * cols + c
  const inBounds = (r, c) => r >= 1 && c >= 1 && r < rows - 1 && c < cols - 1

  const steps = [
    [-2, 0],
    [0, 2],
    [2, 0],
    [0, -2],
  ]

  const startRow = 1
  const startCol = 1
  walls[index(startRow, startCol)] = 0

  /** Cells that are one jump away from the growing tree. */
  const frontier = []
  const queued = new Uint8Array(rows * cols)

  const pushFrontier = (r, c) => {
    for (const [dr, dc] of steps) {
      const nr = r + dr
      const nc = c + dc
      if (!inBounds(nr, nc)) continue
      const i = index(nr, nc)
      if (walls[i] === 0 || queued[i]) continue
      queued[i] = 1
      frontier.push([nr, nc])
    }
  }

  pushFrontier(startRow, startCol)

  while (frontier.length > 0) {
    // Uniform random pick with swap-and-pop removal (O(1) instead of splice).
    const pick = Math.floor(rng() * frontier.length)
    const [row, col] = frontier[pick]
    frontier[pick] = frontier[frontier.length - 1]
    frontier.pop()

    if (walls[index(row, col)] === 0) continue

    // Connect through a randomly chosen neighbour that is already in the tree.
    const connections = []
    for (const [dr, dc] of steps) {
      const nr = row + dr
      const nc = col + dc
      if (!inBounds(nr, nc)) continue
      if (walls[index(nr, nc)] === 0) connections.push([dr, dc])
    }

    if (connections.length > 0) {
      const [dr, dc] = connections[Math.floor(rng() * connections.length)]
      walls[index(row, col)] = 0
      walls[index(row + dr / 2, col + dc / 2)] = 0
      pushFrontier(row, col)
    }
  }

  return walls
}
