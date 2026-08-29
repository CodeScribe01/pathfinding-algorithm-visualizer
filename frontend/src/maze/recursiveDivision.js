import { createWallField, drawBorder } from './mazeUtils.js'

/**
 * Recursive Division.
 *
 * Starts from an empty chamber and recursively bisects it: draw a wall across
 * the chamber, punch exactly one gap in that wall, then recurse into the two
 * sub-chambers. Because every wall keeps a gap, the maze stays fully connected
 * by construction — a solution always exists.
 *
 * Walls are placed on even lines and gaps on odd lines so corridors never end
 * up two cells wide, which is what gives the output its characteristic
 * rectangular-room look.
 *
 * Time  O(rows * cols)
 */
export function recursiveDivision({ rows, cols, isProtected, rng = Math.random }) {
  const walls = createWallField(rows, cols)
  drawBorder(walls, rows, cols, isProtected)

  const placeWall = (row, col) => {
    const index = row * cols + col
    if (isProtected(index)) return
    walls[index] = 1
  }

  const divide = (top, left, height, width) => {
    if (height < 3 || width < 3) return

    // Split along the longer axis so chambers stay roughly square.
    const horizontal = height === width ? rng() < 0.5 : height > width

    if (horizontal) {
      const wallRows = []
      for (let r = top + 1; r < top + height - 1; r += 1) if (r % 2 === 0) wallRows.push(r)
      if (wallRows.length === 0) return
      const wallRow = wallRows[Math.floor(rng() * wallRows.length)]

      const gapCols = []
      for (let c = left; c < left + width; c += 1) if (c % 2 === 1) gapCols.push(c)
      const gapCol =
        gapCols.length > 0
          ? gapCols[Math.floor(rng() * gapCols.length)]
          : left + Math.floor(rng() * width)

      for (let c = left; c < left + width; c += 1) {
        if (c !== gapCol) placeWall(wallRow, c)
      }

      divide(top, left, wallRow - top, width)
      divide(wallRow + 1, left, top + height - wallRow - 1, width)
    } else {
      const wallCols = []
      for (let c = left + 1; c < left + width - 1; c += 1) if (c % 2 === 0) wallCols.push(c)
      if (wallCols.length === 0) return
      const wallCol = wallCols[Math.floor(rng() * wallCols.length)]

      const gapRows = []
      for (let r = top; r < top + height; r += 1) if (r % 2 === 1) gapRows.push(r)
      const gapRow =
        gapRows.length > 0
          ? gapRows[Math.floor(rng() * gapRows.length)]
          : top + Math.floor(rng() * height)

      for (let r = top; r < top + height; r += 1) {
        if (r !== gapRow) placeWall(r, wallCol)
      }

      divide(top, left, height, wallCol - left)
      divide(top, wallCol + 1, height, left + width - wallCol - 1)
    }
  }

  divide(1, 1, rows - 2, cols - 2)
  return walls
}
