import { WEIGHT_COST } from '@/algorithms'

/**
 * Board model used by the React layer.
 *
 * The UI keeps a 2-D array of immutable cell objects so that memoised rows and
 * cells only re-render when they actually change (structural sharing). The
 * search layer, by contrast, wants flat typed arrays — `encodeGrid` bridges the
 * two and is the only place that knows about both representations.
 *
 * cell = { row, col, isWall, weight, isStart, isTarget }
 */

export const createCell = (row, col) => ({
  row,
  col,
  isWall: false,
  weight: 1,
  isStart: false,
  isTarget: false,
})

/** Default marker placement: vertically centred, ~15% in from each edge. */
export function defaultEndpoints(rows, cols) {
  const row = Math.max(1, Math.min(rows - 2, (Math.floor(rows / 2) | 1)))
  const startCol = Math.max(1, Math.min(cols - 2, (Math.floor(cols * 0.15) | 1)))
  const targetCol = Math.max(1, Math.min(cols - 2, (cols - 1 - Math.floor(cols * 0.15)) | 1))
  return {
    start: { row, col: startCol },
    target: { row, col: targetCol },
  }
}

export function createGrid(rows, cols, start, target) {
  const grid = new Array(rows)
  for (let r = 0; r < rows; r += 1) {
    const rowCells = new Array(cols)
    for (let c = 0; c < cols; c += 1) {
      const cell = createCell(r, c)
      if (r === start.row && c === start.col) cell.isStart = true
      if (r === target.row && c === target.col) cell.isTarget = true
      rowCells[c] = cell
    }
    grid[r] = rowCells
  }
  return grid
}

/** Immutable single-cell update: only the touched row array is copied. */
export function updateCell(grid, row, col, patch) {
  const current = grid[row][col]
  const next = { ...current, ...patch }
  const nextRow = grid[row].slice()
  nextRow[col] = next
  const nextGrid = grid.slice()
  nextGrid[row] = nextRow
  return nextGrid
}

/** Apply a predicate-driven reset across every cell (walls, weights, both). */
export function mapGrid(grid, transform) {
  return grid.map((rowCells) => rowCells.map((cell) => transform(cell)))
}

export const clearWalls = (grid) =>
  mapGrid(grid, (cell) => (cell.isWall ? { ...cell, isWall: false } : cell))

export const clearWeights = (grid) =>
  mapGrid(grid, (cell) => (cell.weight > 1 ? { ...cell, weight: 1 } : cell))

export const clearObstacles = (grid) =>
  mapGrid(grid, (cell) =>
    cell.isWall || cell.weight > 1 ? { ...cell, isWall: false, weight: 1 } : cell,
  )

/** Rebuild the board from a generated wall field, preserving the markers. */
export function applyWallField(grid, walls, cols) {
  return mapGrid(grid, (cell) => {
    const isWall = walls[cell.row * cols + cell.col] === 1
    if (cell.isStart || cell.isTarget) {
      return cell.isWall || cell.weight > 1 ? { ...cell, isWall: false, weight: 1 } : cell
    }
    if (cell.isWall === isWall && cell.weight === 1) return cell
    return { ...cell, isWall, weight: 1 }
  })
}

export function moveMarker(grid, from, to, key) {
  if (from.row === to.row && from.col === to.col) return grid
  let next = updateCell(grid, from.row, from.col, { [key]: false })
  next = updateCell(next, to.row, to.col, { [key]: true, isWall: false })
  return next
}

/** Flatten the board into typed arrays for the search layer. */
export function encodeGrid(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const walls = new Uint8Array(rows * cols)
  const weights = new Uint8Array(rows * cols)
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const index = r * cols + c
      const cell = grid[r][c]
      walls[index] = cell.isWall ? 1 : 0
      weights[index] = cell.weight
    }
  }
  return { rows, cols, walls, weights }
}

export const toIndex = (cols, point) => point.row * cols + point.col

/** Compact JSON payload persisted through the SavedGrid API. */
export function serializeGrid(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const walls = []
  const weights = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = grid[r][c]
      if (cell.isWall) walls.push(r * cols + c)
      else if (cell.weight > 1) weights.push(r * cols + c)
    }
  }
  return { rows, cols, walls, weights, weightCost: WEIGHT_COST }
}

export function deserializeGrid(payload, start, target) {
  const { rows, cols, walls = [], weights = [] } = payload
  const grid = createGrid(rows, cols, start, target)
  const wallSet = new Set(walls)
  const weightSet = new Set(weights)
  return mapGrid(grid, (cell) => {
    const index = cell.row * cols + cell.col
    if (cell.isStart || cell.isTarget) return cell
    if (wallSet.has(index)) return { ...cell, isWall: true }
    if (weightSet.has(index)) return { ...cell, weight: WEIGHT_COST }
    return cell
  })
}

export const countCells = (grid, predicate) =>
  grid.reduce((total, rowCells) => total + rowCells.filter(predicate).length, 0)
