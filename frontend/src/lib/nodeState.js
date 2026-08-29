import { NODE_STATE } from './constants'

/**
 * Base visual state of a cell, derived purely from the board model.
 *
 * The animation engine layers `visited` / `path` states on top of this by
 * writing `data-state` directly to the DOM; `clearOverlay()` restores whatever
 * this function returns.
 */
export function baseStateOf(cell) {
  if (!cell) return NODE_STATE.EMPTY
  if (cell.isStart) return NODE_STATE.START
  if (cell.isTarget) return NODE_STATE.TARGET
  if (cell.isWall) return NODE_STATE.WALL
  if (cell.weight > 1) return NODE_STATE.WEIGHT
  return NODE_STATE.EMPTY
}

export const LEGEND_ITEMS = [
  { state: 'start', label: 'Start', description: 'Search origin — drag to move' },
  { state: 'target', label: 'Target', description: 'Goal node — drag to move' },
  { state: 'wall', label: 'Wall', description: 'Impassable cell' },
  { state: 'weight', label: 'Weight', description: 'Costs 5 to enter' },
  { state: 'visited', label: 'Visited', description: 'Node expanded by the search' },
  { state: 'visited-alt', label: 'Reverse', description: 'Backward frontier (Bi-BFS)' },
  { state: 'path', label: 'Path', description: 'Final route returned' },
]
