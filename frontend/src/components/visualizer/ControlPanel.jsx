import { Brush, Eraser, Grid2x2, Save, Shuffle, Weight, Wand2 } from 'lucide-react'
import { Button, Select, Segmented, Slider, Tooltip } from '@/components/ui'
import { ControlSection } from './ControlSection'
import { PlaybackControls } from './PlaybackControls'
import { ALGORITHM_LIST, HEURISTICS } from '@/algorithms'
import { MAZE_LIST } from '@/maze'
import { GRID_PRESETS, SPEED_PRESETS, TOOLS } from '@/lib/constants'

const ALGORITHM_OPTIONS = ALGORITHM_LIST.map((algorithm) => ({
  value: algorithm.id,
  label: `${algorithm.shortName} — ${algorithm.name}`,
}))

const HEURISTIC_OPTIONS = Object.values(HEURISTICS).map((heuristic) => ({
  value: heuristic.id,
  label: `${heuristic.label} · ${heuristic.formula}`,
}))

const MAZE_OPTIONS = MAZE_LIST.map((maze) => ({ value: maze.id, label: maze.name }))

const PRESET_OPTIONS = GRID_PRESETS.map((preset) => ({
  value: preset.id,
  label: `${preset.label} · ${preset.hint}`,
}))

const SPEED_OPTIONS = SPEED_PRESETS.map((speed) => ({ value: speed.id, label: speed.label }))

const TOOL_OPTIONS = [
  { value: TOOLS.WALL, label: 'Wall', icon: Brush, tooltip: 'Draw and erase walls' },
  { value: TOOLS.WEIGHT, label: 'Weight', icon: Weight, tooltip: 'Cells that cost 5 to enter' },
]

/** Left rail: everything that configures or drives a run. */
export function ControlPanel({
  algorithm,
  onAlgorithmChange,
  heuristic,
  onHeuristicChange,
  speedId,
  onSpeedChange,
  tool,
  onToolChange,
  presetId,
  onPresetChange,
  mazeId,
  onMazeChange,
  onGenerate,
  density,
  onDensityChange,
  status,
  onRun,
  onPause,
  onResume,
  onStop,
  onReset,
  onClearWalls,
  onClearWeights,
  onSaveBoard,
  busy,
}) {
  const usesHeuristic = algorithm === 'astar' || algorithm === 'greedy'
  const selectedMaze = MAZE_LIST.find((maze) => maze.id === mazeId)

  return (
    <div className="flex h-full flex-col divide-y divide-hairline">
      <ControlSection>
        <PlaybackControls
          status={status}
          onRun={onRun}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
          onReset={onReset}
        />
      </ControlSection>

      <ControlSection title="Algorithm">
        <Select
          label="Search strategy"
          options={ALGORITHM_OPTIONS}
          value={algorithm}
          onChange={onAlgorithmChange}
          disabled={busy}
        />
        {usesHeuristic ? (
          <Select
            label="Heuristic"
            options={HEURISTIC_OPTIONS}
            value={heuristic}
            onChange={onHeuristicChange}
            disabled={busy}
            hint="Manhattan is admissible on a 4-connected grid, so A* stays optimal."
          />
        ) : null}
        <Segmented label="Speed" options={SPEED_OPTIONS} value={speedId} onChange={onSpeedChange} />
      </ControlSection>

      <ControlSection title="Board">
        <Select
          label="Grid size"
          options={PRESET_OPTIONS}
          value={presetId}
          onChange={onPresetChange}
          disabled={busy}
        />
        <div className="space-y-2">
          <Select
            label="Maze generator"
            options={MAZE_OPTIONS}
            value={mazeId}
            onChange={onMazeChange}
            disabled={busy}
            hint={selectedMaze?.description}
          />
          {mazeId === 'random' ? (
            <Slider
              label="Obstacle density"
              min={5}
              max={45}
              step={1}
              value={Math.round(density * 100)}
              onChange={(value) => onDensityChange(value / 100)}
              format={(value) => `${value}%`}
            />
          ) : null}
          <Button
            className="w-full"
            icon={Wand2}
            onClick={onGenerate}
            disabled={busy}
            variant="subtle"
          >
            Generate maze
          </Button>
        </div>
      </ControlSection>

      <ControlSection title="Drawing tools">
        <Segmented options={TOOL_OPTIONS} value={tool} onChange={onToolChange} />
        <p className="text-2xs leading-relaxed text-ink-ghost">
          Click and drag to paint. Dragging from a painted cell erases; drag the start or target
          marker to move it.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" icon={Eraser} onClick={onClearWalls} disabled={busy}>
            Clear walls
          </Button>
          <Button size="sm" icon={Shuffle} onClick={onClearWeights} disabled={busy}>
            Clear weights
          </Button>
        </div>
      </ControlSection>

      <ControlSection title="Board library">
        <Tooltip label="Save this board to your account" placement="top" className="w-full">
          <Button className="w-full" size="sm" icon={Save} onClick={onSaveBoard} disabled={busy}>
            Save board
          </Button>
        </Tooltip>
        <p className="flex items-center gap-1.5 text-2xs text-ink-ghost">
          <Grid2x2 className="h-3 w-3" aria-hidden />
          Saved boards can be reloaded from any device.
        </p>
      </ControlSection>
    </div>
  )
}

export default ControlPanel
