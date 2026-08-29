import { createWallField } from './mazeUtils.js'

/**
 * Random obstacle scatter.
 *
 * Each free cell independently becomes a wall with probability `density`. The
 * result is not guaranteed to be solvable — that is deliberate: it is the
 * quickest way to demonstrate how each algorithm reports "no path found".
 */
export function randomObstacles({ rows, cols, isProtected, density = 0.27, rng = Math.random }) {
  const walls = createWallField(rows, cols)
  for (let i = 0; i < walls.length; i += 1) {
    if (isProtected(i)) continue
    if (rng() < density) walls[i] = 1
  }
  return walls
}
