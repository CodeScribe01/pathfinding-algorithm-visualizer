import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui'
import {
  BoardToolbar,
  ControlPanel,
  Grid,
  InfoPanel,
  SaveBoardDialog,
  StatsBar,
} from '@/components/visualizer'
import { useBoard } from '@/context/BoardContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { usePathfinder } from '@/hooks/usePathfinder'
import { useVisualizerEngine } from '@/hooks/useVisualizerEngine'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getAlgorithmMeta, DEFAULT_ALGORITHM, DEFAULT_HEURISTIC, ALGORITHM_MAP } from '@/algorithms'
import { baseStateOf } from '@/lib/nodeState'
import { SPEED_PRESETS, DEFAULT_SPEED, TOOLS, VISUALIZER_STATUS } from '@/lib/constants'
import { runsService, gridsService } from '@/services'

const AUTOSAVE_RUNS = import.meta.env.VITE_AUTOSAVE_RUNS !== 'false'

const speedFor = (id) => SPEED_PRESETS.find((preset) => preset.id === id) ?? SPEED_PRESETS[1]

/**
 * Visualiser screen — the composition root that connects the board model, the
 * search layer (worker) and the animation engine. It owns run configuration
 * only: board state lives in BoardContext and playback state in the engine.
 */
export default function VisualizerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    board,
    paint,
    moveMarker,
    clearWalls,
    clearWeights,
    resetBoard,
    setPreset,
    generate,
    encode,
  } = useBoard()
  const { isAuthenticated } = useAuth()
  const toast = useToast()

  const requestedAlgorithm = searchParams.get('algorithm')
  const [algorithmId, setAlgorithmId] = useState(() =>
    requestedAlgorithm && ALGORITHM_MAP[requestedAlgorithm] ? requestedAlgorithm : DEFAULT_ALGORITHM,
  )
  const [heuristic, setHeuristic] = useState(DEFAULT_HEURISTIC)
  const [speedId, setSpeedId] = useLocalStorage('pathforge.speed', DEFAULT_SPEED)
  const [tool, setTool] = useState(TOOLS.WALL)
  const [mazeId, setMazeId] = useState('division')
  const [density, setDensity] = useState(0.27)
  const [result, setResult] = useState(null)
  const [saveOpen, setSaveOpen] = useState(false)

  const cellsRef = useRef(new Map())
  const boardVersionRef = useRef(board.version)
  const algorithm = getAlgorithmMeta(algorithmId)

  const { run, isWorkerSupported } = usePathfinder()

  // Reading the board through a ref keeps `getBaseState` stable, so editing a
  // single cell never tears down and rebuilds the animation engine.
  const gridRef = useRef(board.grid)
  gridRef.current = board.grid
  const getBaseState = useCallback((row, col) => baseStateOf(gridRef.current[row][col]), [])

  const persistRun = useCallback(
    (searchResult) => {
      if (!AUTOSAVE_RUNS || !isAuthenticated || !searchResult) return
      runsService
        .create({
          algorithm: algorithmId,
          rows: board.rows,
          cols: board.cols,
          result: searchResult,
          mazeType: board.mazeType,
          heuristic: algorithmId === 'astar' || algorithmId === 'greedy' ? heuristic : null,
        })
        .catch((error) => {
          // History is a convenience, never a blocker for the visualisation.
          console.warn('Could not save run to history:', error.message)
        })
    },
    [algorithmId, board.rows, board.cols, board.mazeType, heuristic, isAuthenticated],
  )

  const engine = useVisualizerEngine({
    cellsRef,
    cols: board.cols,
    getBaseState,
    onComplete: persistRun,
  })

  const { status, liveStats, play, pause, resume, stop, setSpeed, setComputing } = engine
  const isBusy =
    status === VISUALIZER_STATUS.RUNNING ||
    status === VISUALIZER_STATUS.PAUSED ||
    status === VISUALIZER_STATUS.COMPUTING

  // Speed changes apply mid-run.
  useEffect(() => {
    setSpeed(speedFor(speedId).stepsPerSecond)
  }, [speedId, setSpeed])

  // Any structural board change invalidates the current result and overlay.
  useEffect(() => {
    if (boardVersionRef.current === board.version) return
    boardVersionRef.current = board.version
    stop()
    setResult(null)
  }, [board.version, stop])

  const handleRun = useCallback(async () => {
    if (isBusy) return
    stop()
    setResult(null)
    setComputing()

    const { encoded, source, target } = encode()
    try {
      const searchResult = await run(algorithmId, encoded, source, target, { heuristic })
      setResult(searchResult)
      play(searchResult, speedFor(speedId).stepsPerSecond)
      if (!searchResult.found) {
        toast.error('No path found', {
          description: 'Every reachable node was expanded without reaching the target.',
        })
      }
    } catch (error) {
      stop()
      toast.error('Search failed', { description: error.message })
    }
  }, [algorithmId, encode, heuristic, isBusy, play, run, speedId, setComputing, stop, toast])

  const handleGenerate = useCallback(() => {
    if (isBusy) return
    generate(mazeId, { density })
  }, [density, generate, isBusy, mazeId])

  const handleReset = useCallback(() => {
    stop()
    setResult(null)
    resetBoard()
  }, [resetBoard, stop])

  const handleSaveBoard = useCallback(
    async (name) => {
      await gridsService.create({ name, grid: board.grid, start: board.start, target: board.target })
      toast.success('Board saved', { description: `"${name}" is available from Saved boards.` })
    },
    [board.grid, board.start, board.target, toast],
  )

  const handleAlgorithmChange = useCallback(
    (nextId) => {
      setAlgorithmId(nextId)
      setSearchParams({ algorithm: nextId }, { replace: true })
    },
    [setSearchParams],
  )

  const shortcuts = useMemo(
    () => ({
      ' ': () => {
        if (status === VISUALIZER_STATUS.RUNNING) pause()
        else if (status === VISUALIZER_STATUS.PAUSED) resume()
        else handleRun()
      },
      Escape: () => stop(),
      r: () => handleReset(),
      m: () => handleGenerate(),
      w: () => setTool(TOOLS.WALL),
      g: () => setTool(TOOLS.WEIGHT),
    }),
    [handleGenerate, handleReset, handleRun, pause, resume, status, stop],
  )
  useKeyboardShortcuts(shortcuts)

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-4 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[268px_minmax(0,1fr)_296px]">
        <Card className="order-2 h-fit overflow-hidden lg:sticky lg:top-[4.5rem] lg:order-1">
          <ControlPanel
            algorithm={algorithmId}
            onAlgorithmChange={handleAlgorithmChange}
            heuristic={heuristic}
            onHeuristicChange={setHeuristic}
            speedId={speedId}
            onSpeedChange={setSpeedId}
            tool={tool}
            onToolChange={setTool}
            presetId={board.presetId}
            onPresetChange={setPreset}
            mazeId={mazeId}
            onMazeChange={setMazeId}
            onGenerate={handleGenerate}
            density={density}
            onDensityChange={setDensity}
            status={status}
            onRun={handleRun}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            onReset={handleReset}
            onClearWalls={clearWalls}
            onClearWeights={clearWeights}
            onSaveBoard={() => setSaveOpen(true)}
            busy={isBusy}
          />
        </Card>

        <div className="order-1 min-w-0 lg:order-2">
          <BoardToolbar board={board} algorithm={algorithm} workerActive={isWorkerSupported} />
          <Grid
            board={board}
            tool={tool}
            disabled={isBusy}
            onPaint={paint}
            onMoveMarker={moveMarker}
            cellsRef={cellsRef}
          />
          <div className="mt-3">
            <StatsBar result={result} liveStats={liveStats} isAnimating={isBusy} />
          </div>
        </div>

        <Card className="order-3 h-fit overflow-hidden lg:sticky lg:top-[4.5rem]">
          <InfoPanel algorithm={algorithm} status={status} liveStats={liveStats} result={result} />
        </Card>
      </div>

      <SaveBoardDialog
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={handleSaveBoard}
        isAuthenticated={isAuthenticated}
        defaultName={`${algorithm.shortName} board ${board.rows}x${board.cols}`}
      />
    </div>
  )
}
