import { memo } from 'react'
import { baseStateOf } from '@/lib/nodeState'

/**
 * A single board cell.
 *
 * Deliberately prop-thin and memoised: during a run the cell's `data-state` is
 * mutated straight on the DOM by the animation engine, so React never
 * re-renders the grid while the search plays. A cell only re-renders when the
 * user actually edits it.
 */
export const Node = memo(function Node({ cell, index, register }) {
  const state = baseStateOf(cell)
  const isMarker = cell.isStart || cell.isTarget

  return (
    <div
      ref={register}
      className="node"
      data-index={index}
      data-row={cell.row}
      data-col={cell.col}
      data-state={state}
      data-fixed={isMarker ? '1' : undefined}
      role="gridcell"
      aria-label={cell.isStart ? 'Start node' : cell.isTarget ? 'Target node' : undefined}
    />
  )
})

export default Node
