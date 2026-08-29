/**
 * Shared helpers for the maze/obstacle generators.
 *
 * Generators work on a flat Uint8Array wall field (1 = wall) using the same
 * `index = row * cols + col` encoding as the search algorithms, so a generated
 * maze can be fed straight into a run without any conversion.
 */

export const createWallField = (rows, cols, filled = false) =>
  filled ? new Uint8Array(rows * cols).fill(1) : new Uint8Array(rows * cols)

/** Fisher-Yates shuffle (in place). */
export function shuffle(items, rng = Math.random) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = items[i]
    items[i] = items[j]
    items[j] = tmp
  }
  return items
}

export const randomFrom = (items, rng = Math.random) => items[Math.floor(rng() * items.length)]

/**
 * Clear a cell and its four neighbours.
 *
 * Lattice mazes (recursive backtracking, Prim) only carve cells on odd rows and
 * odd columns. The start/target markers can land anywhere, so opening a plus
 * shape around them guarantees a connection into the corridor network: every
 * orthogonal neighbour of an arbitrary cell is itself adjacent to an odd/odd
 * corridor cell.
 */
export function openArea(walls, rows, cols, row, col) {
  const clear = (r, c) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols) return
    walls[r * cols + c] = 0
  }
  clear(row, col)
  clear(row - 1, col)
  clear(row + 1, col)
  clear(row, col - 1)
  clear(row, col + 1)
}

/** Draw the outer border used by the chamber-based generators. */
export function drawBorder(walls, rows, cols, isProtected) {
  for (let c = 0; c < cols; c += 1) {
    const top = c
    const bottom = (rows - 1) * cols + c
    if (!isProtected(top)) walls[top] = 1
    if (!isProtected(bottom)) walls[bottom] = 1
  }
  for (let r = 0; r < rows; r += 1) {
    const left = r * cols
    const right = r * cols + cols - 1
    if (!isProtected(left)) walls[left] = 1
    if (!isProtected(right)) walls[right] = 1
  }
}
