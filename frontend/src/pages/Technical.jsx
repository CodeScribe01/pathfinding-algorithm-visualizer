import { PageHeader, Badge } from '@/components/ui'
import { PseudocodeBlock } from '@/components/algorithms/PseudocodeBlock'
import { ALGORITHM_LIST, WEIGHT_COST } from '@/algorithms'
import { MAZE_LIST } from '@/maze'

const SECTIONS = [
  { id: 'graph', label: 'Graph representation' },
  { id: 'search', label: 'Search strategy' },
  { id: 'queue', label: 'Priority queue' },
  { id: 'heuristic', label: 'A* heuristic' },
  { id: 'maze', label: 'Maze generation' },
  { id: 'complexity', label: 'Complexity analysis' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'performance', label: 'Performance' },
]

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-hairline pt-8 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-4 text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  )
}

const GRAPH_SNIPPET = `// Implicit graph — no adjacency list is ever materialised.
// A 33 x 71 board is 2,343 vertices and ~4,600 edges.

index   = row * cols + col          // vertex id
walls   = Uint8Array(rows * cols)   // 1 = impassable
weights = Uint8Array(rows * cols)   // entry cost: 1, or ${WEIGHT_COST} when weighted

neighbours(v):                      // 4-connected, derived arithmetically
    for (dr, dc) in [(-1,0), (0,1), (1,0), (0,-1)]:
        u = (row(v) + dr) * cols + (col(v) + dc)
        if in bounds and not walls[u]: yield u`

const RESULT_SNIPPET = `// Every algorithm returns the same envelope.
{
  visitedOrder: [{ row, col, frontierSize, side? }],  // expansion trace
  path:         [{ row, col }],                       // reconstructed route
  pathCost:     number,     // sum of entry costs
  pathLength:   number,     // edges walked
  nodesVisited: number,     // vertices dequeued
  maxFrontier:  number,     // peak queue size (space proxy)
  operations:   number,     // edges relaxed
  executionTime: number,    // ms, measured around the search only
  found:        boolean,
}`

export default function TechnicalPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Engineering"
        title="Technical details"
        description="How PathForge is built: the graph model the searches run on, the data structures behind them, the maze generators, and how the React front end and Django API divide the work."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label="Section index">
          <ul className="sticky top-20 space-y-0.5">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-md px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:bg-elevated hover:text-ink"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          <Section id="graph" title="Graph representation">
            <p>
              The board is an <strong className="text-ink">implicit graph</strong>: every walkable
              cell is a vertex and edges connect 4-adjacent cells. Building an adjacency list would
              cost O(V + E) memory and thousands of allocations per run, so neighbours are derived
              arithmetically from flat typed arrays instead. Vertex ids are plain integers, which
              lets every bookkeeping structure be a typed array too.
            </p>
            <p>
              Edge weights are modelled as <em>node entry costs</em>: stepping onto cell{' '}
              <code className="font-mono text-accent-soft">n</code> costs{' '}
              <code className="font-mono text-accent-soft">weights[n]</code>. That keeps the encoding
              to two bytes per cell while still producing a genuinely weighted graph for Dijkstra
              and A*.
            </p>
            <PseudocodeBlock code={GRAPH_SNIPPET} label="Encoding" />
          </Section>

          <Section id="search" title="Search strategy">
            <p>
              Algorithms are pure functions over the encoded grid — no DOM, no React, no framework
              imports. Each one records its expansion order and returns a single normalised
              envelope, which is what keeps the visualiser, the comparison page and the API layer
              decoupled from search internals. Adding a seventh algorithm means writing one module
              and one catalogue entry.
            </p>
            <PseudocodeBlock code={RESULT_SNIPPET} label="Execution result" />
            <p>
              <strong className="text-ink">Nodes visited</strong> counts vertices dequeued and
              expanded; <strong className="text-ink">nodes explored</strong> counts edge relaxations;{' '}
              <strong className="text-ink">peak frontier</strong> is the largest the queue ever grew,
              which is the practical stand-in for measured memory in a JavaScript runtime that does
              not expose per-object allocation.
            </p>
          </Section>

          <Section id="queue" title="Priority queue implementation">
            <p>
              Dijkstra, A* and Greedy Best-First share a hand-written binary min-heap. Keys and
              priorities live in parallel{' '}
              <code className="font-mono text-accent-soft">Int32Array</code> and{' '}
              <code className="font-mono text-accent-soft">Float64Array</code> buffers that double in
              size on demand, so no wrapper object is allocated per push — on a large board the heap
              absorbs tens of thousands of insertions.
            </p>
            <p>
              There is deliberately <strong className="text-ink">no decrease-key</strong>. Relaxing
              an edge pushes a second entry with the better priority (lazy deletion) and the stale
              entry is discarded on pop, because that vertex is already finalised. This trades a
              little extra heap traffic for dropping the index-tracking table entirely, and keeps
              every operation at O(log V).
            </p>
          </Section>

          <Section id="heuristic" title="A* heuristic">
            <p>
              A* orders its frontier by f(n) = g(n) + h(n). The default heuristic is{' '}
              <strong className="text-ink">Manhattan distance</strong>, which on a 4-connected grid
              where the cheapest step costs 1 is both <em>admissible</em> (never over-estimates) and{' '}
              <em>consistent</em> — so A* returns exactly the same optimal cost as Dijkstra while
              expanding far fewer vertices.
            </p>
            <p>
              Euclidean and Chebyshev are selectable to make the trade-off tangible: both stay
              admissible here but under-estimate more, so the explored region visibly swells while
              the path stays optimal. No tie-breaking multiplier is applied — scaling h upward would
              trade the optimality guarantee for speed.
            </p>
          </Section>

          <Section id="maze" title="Maze generation">
            <p>
              Four generators write into the same flat wall field, so a generated maze feeds
              straight into a search with no conversion step.
            </p>
            <ul className="space-y-2">
              {MAZE_LIST.map((maze) => (
                <li key={maze.id} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span>
                    <strong className="text-ink">{maze.name}</strong> — {maze.description}
                  </span>
                </li>
              ))}
            </ul>
            <p>
              The two lattice generators carve corridors only on odd rows and columns, so the start
              and target — which the user can drop anywhere — are given a one-cell opening in each
              direction afterwards. Every orthogonal neighbour of an arbitrary cell touches an
              odd/odd corridor cell, so that opening always reconnects the markers to the maze.
            </p>
          </Section>

          <Section id="complexity" title="Complexity analysis">
            <p>
              V is the number of walkable cells, E the number of edges (at most 4V on this board), b
              the branching factor and d the solution depth.
            </p>
            <div className="overflow-x-auto rounded-card border border-hairline">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-hairline bg-elevated text-2xs uppercase tracking-wider text-ink-ghost">
                    <th scope="col" className="px-4 py-2.5 font-medium">Algorithm</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Time</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Space</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Optimality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {ALGORITHM_LIST.map((algorithm) => (
                    <tr key={algorithm.id} className="text-xs">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: algorithm.accent }}
                            aria-hidden
                          />
                          <span className="font-medium text-ink">{algorithm.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-accent-soft">
                        {algorithm.timeComplexity}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink-muted">
                        {algorithm.spaceComplexity}
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{algorithm.optimalityNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="architecture" title="Frontend / backend architecture">
            <p>
              Search runs entirely in the browser. That is a design decision, not a shortcut: an
              animated visualiser needs the expansion trace locally at 60 fps, and round-tripping
              2 000 steps to a server would add latency without adding correctness. Django owns
              exactly what a browser should not — identity, durable storage and aggregation.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-card border border-hairline bg-panel p-4">
                <p className="label-caps mb-2">Browser</p>
                <ul className="space-y-1.5 font-mono text-2xs text-ink-faint">
                  <li>algorithms/ — six pure search modules</li>
                  <li>maze/ — four generators over a wall field</li>
                  <li>workers/ — search off the main thread</li>
                  <li>hooks/useVisualizerEngine — rAF playback</li>
                  <li>context/BoardContext — shared board state</li>
                </ul>
              </div>
              <div className="rounded-card border border-hairline bg-panel p-4">
                <p className="label-caps mb-2">Django REST API</p>
                <ul className="space-y-1.5 font-mono text-2xs text-ink-faint">
                  <li>accounts/ — custom user + JWT auth</li>
                  <li>visualizations/ — runs, saved grids</li>
                  <li>/api/statistics/ — ORM aggregation</li>
                  <li>drf-spectacular — OpenAPI 3 + Swagger</li>
                  <li>SQL Server via mssql-django</li>
                </ul>
              </div>
            </div>
            <p>
              The API surface is small and REST-shaped:{' '}
              <code className="font-mono text-accent-soft">/api/auth/*</code> for registration, login
              and token refresh; <code className="font-mono text-accent-soft">/api/runs/</code> for
              history; <code className="font-mono text-accent-soft">/api/grids/</code> for saved
              boards; and <code className="font-mono text-accent-soft">/api/statistics/</code> for the
              analytics dashboard. Every list is scoped to the authenticated user in the queryset,
              never in the client.
            </p>
          </Section>

          <Section id="performance" title="Performance engineering">
            <p>
              A 33 × 71 board is 2 343 cells. Three decisions keep it smooth:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  <strong className="text-ink">Search runs on a Web Worker.</strong> Computing a full
                  trace never blocks input, and the comparison page can run six algorithms without
                  freezing the UI. A synchronous fallback keeps the app working where workers are
                  unavailable.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  <strong className="text-ink">Animation bypasses React.</strong> The engine writes{' '}
                  <code className="font-mono text-accent-soft">data-state</code> straight onto cell
                  DOM nodes and CSS owns the transition, so the component tree does not re-render
                  during playback. Only the throttled stats readout touches React state.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                <span>
                  <strong className="text-ink">Editing uses structural sharing.</strong> Painting a
                  wall copies one row and one cell, so memoised cells outside that row skip
                  re-rendering entirely. Pointer handling is delegated to the board container rather
                  than bound per cell.
                </span>
              </li>
            </ul>
            <p>
              Playback itself is time-based rather than frame-based: each frame consumes{' '}
              <code className="font-mono text-accent-soft">dt × stepsPerSecond</code> from a budget,
              so the animation runs at the same speed on 60 Hz and 144 Hz displays and speed changes
              apply mid-run.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone="accent">Web Worker</Badge>
              <Badge tone="accent">requestAnimationFrame</Badge>
              <Badge tone="accent">Typed arrays</Badge>
              <Badge tone="accent">Memoised cells</Badge>
              <Badge tone="accent">Event delegation</Badge>
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
