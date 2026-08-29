import { memo, useCallback, useEffect, useRef } from 'react'
import { Node } from './Node'
import { TOOLS } from '@/lib/constants'
import { cn } from '@/lib/cn'

/** Rows exist only to satisfy the ARIA grid structure — they generate no box. */
const ROW_STYLE = { display: 'contents' }

/**
 * Interactive board.
 *
 * Pointer handling is delegated to the container rather than bound per cell:
 * with up to 2 300 cells that removes thousands of listeners and keeps the
 * memoised `Node` props stable. The cell under the pointer is resolved with
 * `elementFromPoint`, which also makes drag-painting work on touch devices
 * where `pointerenter` never fires on siblings.
 */
export const Grid = memo(function Grid({
  board,
  tool = TOOLS.WALL,
  disabled = false,
  onPaint,
  onMoveMarker,
  cellsRef,
  className,
}) {
  const { grid, rows, cols } = board
  const dragRef = useRef({ active: false, mode: null, erase: false, lastIndex: -1 })

  // Cell elements are keyed by flat index so the animation engine can paint
  // them directly. The registry is reset during render when the board is
  // resized — never in an effect: React 18 StrictMode runs effect cleanups
  // without re-attaching refs, so clearing there would empty the registry for
  // good and the search would animate onto nothing.
  const dimensionKey = `${rows}x${cols}`
  const dimensionRef = useRef(dimensionKey)
  if (dimensionRef.current !== dimensionKey) {
    dimensionRef.current = dimensionKey
    cellsRef.current.clear()
  }

  const register = useCallback(
    (element) => {
      if (!element) return
      cellsRef.current.set(Number(element.dataset.index), element)
    },
    [cellsRef],
  )

  const resolveCell = (event) => {
    const element = document.elementFromPoint(event.clientX, event.clientY)
    if (!element || !element.classList.contains('node')) return null
    const row = Number(element.dataset.row)
    const col = Number(element.dataset.col)
    if (Number.isNaN(row) || Number.isNaN(col)) return null
    return { row, col, index: row * cols + col }
  }

  const handlePointerDown = (event) => {
    if (disabled || event.button === 2) return
    const position = resolveCell(event)
    if (!position) return
    event.preventDefault()

    const cell = grid[position.row][position.col]
    const drag = dragRef.current
    drag.active = true
    drag.lastIndex = position.index

    if (cell.isStart) {
      drag.mode = 'start'
      return
    }
    if (cell.isTarget) {
      drag.mode = 'target'
      return
    }

    // Dragging repeats whatever the first click did: paint or erase.
    drag.mode = 'paint'
    drag.erase = tool === TOOLS.WEIGHT ? cell.weight > 1 : cell.isWall
    onPaint?.(position.row, position.col, tool, drag.erase)
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag.active || disabled) return
    const position = resolveCell(event)
    if (!position || position.index === drag.lastIndex) return
    drag.lastIndex = position.index

    if (drag.mode === 'start' || drag.mode === 'target') {
      onMoveMarker?.(drag.mode, position.row, position.col)
      return
    }
    onPaint?.(position.row, position.col, tool, drag.erase)
  }

  const endDrag = useCallback(() => {
    dragRef.current.active = false
    dragRef.current.mode = null
    dragRef.current.lastIndex = -1
  }, [])

  useEffect(() => {
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
    return () => {
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [endDrag])

  return (
    <div
      className={cn(
        // Horizontal scroll keeps cells legible on narrow screens instead of
        // squeezing 59 columns into 375px.
        'relative overflow-x-auto rounded-card border border-hairline bg-panel',
        disabled && 'cursor-progress',
        className,
      )}
    >
      <div
        role="grid"
        aria-label={`Pathfinding board, ${rows} rows by ${cols} columns`}
        aria-disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onContextMenu={(event) => event.preventDefault()}
        className="grid touch-none select-none border-l border-t border-hairline/60"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          minWidth: `${cols * 9}px`,
          maxWidth: `${cols * 30}px`,
        }}
      >
        {grid.map((rowCells, rowIndex) => (
          // `display: contents` keeps the ARIA grid > row > gridcell structure
          // valid without adding a layout box between the grid and its cells.
          <div key={rowIndex} role="row" style={ROW_STYLE}>
            {rowCells.map((cell) => (
              <Node
                key={cell.col}
                cell={cell}
                index={cell.row * cols + cell.col}
                register={register}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
})

export default Grid
