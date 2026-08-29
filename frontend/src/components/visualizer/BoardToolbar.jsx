import { Cpu, Grid3x3, Info } from 'lucide-react'
import { Badge, Tooltip } from '@/components/ui'
import { Legend } from './Legend'
import { MAZE_MAP } from '@/maze'
import { WEIGHT_COST } from '@/algorithms'

/** Thin strip above the board: what is on screen, and the colour key. */
export function BoardToolbar({ board, algorithm, workerActive }) {
  const maze = board.mazeType ? MAZE_MAP[board.mazeType] : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge mono tone="neutral">
          <Grid3x3 className="h-3 w-3" aria-hidden />
          {board.rows} × {board.cols}
        </Badge>
        <Badge tone="accent">{algorithm.shortName}</Badge>
        {maze ? <Badge tone="neutral">{maze.name}</Badge> : null}
        <Tooltip label={`Weighted cells cost ${WEIGHT_COST} to enter instead of 1`}>
          <span className="inline-flex items-center gap-1 text-2xs text-ink-ghost">
            <Info className="h-3 w-3" aria-hidden />
            weight = {WEIGHT_COST}
          </span>
        </Tooltip>
        {workerActive ? (
          <Tooltip label="Searches run on a Web Worker, off the main thread">
            <span className="inline-flex items-center gap-1 text-2xs text-ink-ghost">
              <Cpu className="h-3 w-3" aria-hidden />
              worker
            </span>
          </Tooltip>
        ) : null}
      </div>

      <Legend className="flex flex-wrap items-center gap-x-3 gap-y-1.5" />
    </div>
  )
}

export default BoardToolbar
