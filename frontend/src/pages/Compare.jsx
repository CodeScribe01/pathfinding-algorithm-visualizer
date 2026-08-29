import { useCallback, useMemo, useRef, useState } from 'react'
import { BarChart3, Play, Trash2, Wand2 } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  Select,
  Spinner,
} from '@/components/ui'
import { Grid } from '@/components/visualizer'
import {
  AlgorithmPicker,
  ComparisonCharts,
  ComparisonTable,
  MiniBoard,
  VerdictSummary,
} from '@/components/compare'
import { useBoard } from '@/context/BoardContext'
import { useToast } from '@/context/ToastContext'
import { usePathfinder } from '@/hooks/usePathfinder'
import { getAlgorithmMeta, DEFAULT_HEURISTIC } from '@/algorithms'
import { MAZE_LIST } from '@/maze'
import { GRID_PRESETS, TOOLS } from '@/lib/constants'

const MAZE_OPTIONS = MAZE_LIST.map((maze) => ({ value: maze.id, label: maze.name }))
const PRESET_OPTIONS = GRID_PRESETS.map((preset) => ({
  value: preset.id,
  label: `${preset.label} · ${preset.hint}`,
}))

/**
 * Comparison workspace.
 *
 * The board comes from BoardContext, which means whatever the user drew in the
 * visualiser is the exact input every algorithm receives here — same walls,
 * same weights, same endpoints. That is the whole point of the page.
 */
export default function ComparePage() {
  const { board, paint, moveMarker, setPreset, generate, clearBoard, encode } = useBoard()
  const { run } = usePathfinder()
  const toast = useToast()

  const cellsRef = useRef(new Map())
  const [selected, setSelected] = useState(['bfs', 'dijkstra', 'astar', 'greedy'])
  const [mazeId, setMazeId] = useState('division')
  const [results, setResults] = useState(null)
  const [running, setRunning] = useState(false)
  const [ranAtVersion, setRanAtVersion] = useState(null)

  const toggle = useCallback((id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    )
  }, [])

  const handleRun = useCallback(async () => {
    if (selected.length === 0) {
      toast.error('Pick at least one algorithm')
      return
    }

    setRunning(true)
    const { encoded, source, target } = encode()

    try {
      // The worker processes jobs one at a time, so each timing is measured in
      // isolation even though the calls are issued together.
      const settled = await Promise.all(
        selected.map((id) => run(id, encoded, source, target, { heuristic: DEFAULT_HEURISTIC })),
      )

      setResults(
        settled.map((result, index) => {
          const meta = getAlgorithmMeta(selected[index])
          return {
            id: meta.id,
            name: meta.shortName,
            accent: meta.accent,
            guaranteesShortestPath: meta.guaranteesShortestPath,
            nodesVisited: result.nodesVisited,
            pathLength: result.pathLength,
            pathCost: result.pathCost,
            executionTime: result.executionTime,
            maxFrontier: result.maxFrontier,
            found: result.found,
            result,
          }
        }),
      )
      setRanAtVersion(board.version)
    } catch (error) {
      toast.error('Comparison failed', { description: error.message })
    } finally {
      setRunning(false)
    }
  }, [board.version, encode, run, selected, toast])

  const isStale = results !== null && ranAtVersion !== board.version

  const chartRows = useMemo(() => results ?? [], [results])

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Benchmark"
        title="Compare algorithms"
        description="Run any combination of searches against one identical board and read the trade-offs directly: how much of the graph each one expanded, what it cost, and how long it took."
        actions={
          <Button variant="primary" icon={Play} onClick={handleRun} loading={running}>
            Run comparison
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Shared board"
            description="Every selected algorithm receives this exact grid"
            actions={
              <Badge mono tone="neutral">
                {board.rows} × {board.cols}
              </Badge>
            }
          />
          <div className="p-4">
            <Grid
              board={board}
              tool={TOOLS.WALL}
              disabled={running}
              onPaint={paint}
              onMoveMarker={moveMarker}
              cellsRef={cellsRef}
            />
            <p className="mt-3 text-2xs text-ink-ghost">
              Draw walls, drag the start or target marker, or generate a maze — the comparison
              always uses the board exactly as it stands when you press run.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Setup" />
            <div className="space-y-4 p-4">
              <AlgorithmPicker selected={selected} onToggle={toggle} />

              <Select
                label="Grid size"
                options={PRESET_OPTIONS}
                value={board.presetId}
                onChange={setPreset}
                disabled={running}
              />

              <div className="space-y-2">
                <Select
                  label="Maze generator"
                  options={MAZE_OPTIONS}
                  value={mazeId}
                  onChange={setMazeId}
                  disabled={running}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    icon={Wand2}
                    variant="subtle"
                    onClick={() => generate(mazeId)}
                    disabled={running}
                  >
                    Generate
                  </Button>
                  <Button size="sm" icon={Trash2} onClick={clearBoard} disabled={running}>
                    Clear board
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {isStale ? (
            <div className="rounded-card border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-2xs leading-relaxed text-amber-300">
              The board changed since this comparison ran. Press <strong>Run comparison</strong> to
              refresh the numbers.
            </div>
          ) : null}
        </div>
      </div>

      <section className="mt-6 space-y-4">
        {running && !results ? (
          <Card>
            <div className="flex items-center justify-center gap-2 px-6 py-16">
              <Spinner />
              <span className="text-xs text-ink-muted">Running {selected.length} searches…</span>
            </div>
          </Card>
        ) : null}

        {!results && !running ? (
          <Card>
            <EmptyState
              icon={BarChart3}
              title="No comparison yet"
              description="Select the algorithms you want to benchmark, shape the board, then run the comparison to see nodes visited, path cost and execution time side by side."
              action={
                <Button size="sm" variant="primary" icon={Play} onClick={handleRun}>
                  Run comparison
                </Button>
              }
            />
          </Card>
        ) : null}

        {results ? (
          <>
            <VerdictSummary rows={results} />

            <Card className="overflow-hidden">
              <CardHeader
                title="Results"
                description="Best value in each column is highlighted"
              />
              <ComparisonTable rows={results} />
            </Card>

            <ComparisonCharts rows={chartRows} />

            <Card>
              <CardHeader
                title="Explored area"
                description="Indigo shows every node the search expanded; amber is the returned path"
              />
              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((row) => (
                  <div key={row.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-ink">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: row.accent }}
                          aria-hidden
                        />
                        {row.name}
                      </span>
                      <span className="font-mono text-2xs text-ink-faint">
                        {row.nodesVisited} visited
                      </span>
                    </div>
                    <MiniBoard board={board} result={row.result} />
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </section>
    </div>
  )
}
