import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import { Button, Kbd, Tooltip } from '@/components/ui'
import { VISUALIZER_STATUS } from '@/lib/constants'

/**
 * Transport controls. The primary button is context-aware: it starts, pauses
 * and resumes so the most common action is always one click away.
 */
export function PlaybackControls({ status, onRun, onPause, onResume, onStop, onReset }) {
  const isRunning = status === VISUALIZER_STATUS.RUNNING
  const isPaused = status === VISUALIZER_STATUS.PAUSED
  const isComputing = status === VISUALIZER_STATUS.COMPUTING
  const isBusy = isRunning || isPaused || isComputing

  const primary = isRunning
    ? { label: 'Pause', icon: Pause, action: onPause }
    : isPaused
      ? { label: 'Resume', icon: Play, action: onResume }
      : { label: 'Visualize', icon: Play, action: onRun }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          icon={primary.icon}
          loading={isComputing}
          onClick={primary.action}
          disabled={isComputing}
        >
          {isComputing ? 'Computing…' : primary.label}
        </Button>

        <Tooltip label="Stop and clear the search" shortcut="Esc">
          <Button
            size="lg"
            icon={Square}
            onClick={onStop}
            disabled={!isBusy && status !== VISUALIZER_STATUS.DONE}
            aria-label="Stop visualization"
          />
        </Tooltip>

        <Tooltip label="Reset the whole board" shortcut="R">
          <Button size="lg" icon={RotateCcw} onClick={onReset} aria-label="Reset board" />
        </Tooltip>
      </div>

      <p className="flex flex-wrap items-center gap-1.5 text-2xs text-ink-ghost">
        <Kbd>Space</Kbd> play / pause
        <span className="text-hairline-strong">·</span>
        <Kbd>Esc</Kbd> stop
        <span className="text-hairline-strong">·</span>
        <Kbd>R</Kbd> reset
        <span className="text-hairline-strong">·</span>
        <Kbd>M</Kbd> maze
      </p>
    </div>
  )
}

export default PlaybackControls
