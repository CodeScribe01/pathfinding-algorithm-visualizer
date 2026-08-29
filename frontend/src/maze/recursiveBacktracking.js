import { createWallField, shuffle } from './mazeUtils.js'

/**
 * Recursive Backtracking (randomised DFS maze carving).
 *
 * Starts from a solid block and carves corridors on the odd/odd lattice: from
 * the current cell, jump two cells to a random unvisited neighbour and knock
 * out the wall between them. When a cell has no unvisited neighbours the walker
 * backtracks along an explicit stack.
 *
 * Produces a "perfect" maze — exactly one path between any two corridor cells,
 * no loops — which is why DFS and BFS often look surprisingly similar on it.
 *
 * Time  O(rows * cols)
 */
export function recursiveBacktracking({ rows, cols, rng = Math.random }) {
  const walls = createWallField(rows, cols, true)
  const index = (r, c) => r * cols + c

  const startRow = 1
  const startCol = 1
  walls[index(startRow, startCol)] = 0

  const stack = [[startRow, startCol]]
  const steps = [
    [-2, 0],
    [0, 2],
    [2, 0],
    [0, -2],
  ]

  while (stack.length > 0) {
    const [row, col] = stack[stack.length - 1]
    const candidates = shuffle([...steps], rng)
    let advanced = false

    for (const [dr, dc] of candidates) {
      const nr = row + dr
      const nc = col + dc
      if (nr < 1 || nc < 1 || nr >= rows - 1 || nc >= cols - 1) continue
      if (walls[index(nr, nc)] === 0) continue // already part of the maze

      // Knock out the cell between current and neighbour, then move in.
      walls[index(row + dr / 2, col + dc / 2)] = 0
      walls[index(nr, nc)] = 0
      stack.push([nr, nc])
      advanced = true
      break
    }

    if (!advanced) stack.pop() // dead end: backtrack
  }

  return walls
}
