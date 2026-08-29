import { useEffect, useRef } from 'react'

/**
 * Canvas thumbnail of a completed run: walls, the region each search expanded
 * and the path it returned. Canvas rather than DOM because there is one of
 * these per algorithm and each covers the whole board.
 */
export function MiniBoard({ board, result, height = 96 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { rows, cols, grid } = board
    const dpr = window.devicePixelRatio || 1
    const cell = Math.max(1, Math.floor((height / rows) * dpr) / dpr)
    const width = cell * cols

    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(cell * rows * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${cell * rows}px`

    const context = canvas.getContext('2d')
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    context.fillStyle = '#0c0e11'
    context.fillRect(0, 0, width, cell * rows)

    // Walls first, then the visited region, then the path on top.
    context.fillStyle = '#262c34'
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (grid[r][c].isWall) context.fillRect(c * cell, r * cell, cell, cell)
      }
    }

    if (result) {
      context.fillStyle = 'rgba(99,102,241,0.28)'
      result.visitedOrder.forEach((node) => {
        context.fillRect(node.col * cell, node.row * cell, cell, cell)
      })

      context.fillStyle = '#f59e0b'
      result.path.forEach((node) => {
        context.fillRect(node.col * cell, node.row * cell, cell, cell)
      })
    }

    const markers = [
      { point: board.start, color: '#10b981' },
      { point: board.target, color: '#f43f5e' },
    ]
    markers.forEach(({ point, color }) => {
      context.fillStyle = color
      context.fillRect(point.col * cell, point.row * cell, Math.max(cell, 2), Math.max(cell, 2))
    })
  }, [board, result, height])

  return (
    <div className="flex justify-center overflow-hidden rounded-md border border-hairline bg-canvas p-1">
      <canvas ref={canvasRef} role="img" aria-label="Explored area preview" />
    </div>
  )
}

export default MiniBoard
