import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Boxes,
  Cpu,
  Database,
  GitCompareArrows,
  Layers,
  LineChart,
  Server,
  Sparkles,
  Workflow,
} from 'lucide-react'
import { buttonStyles } from '@/components/ui'
import { HeroBoard } from '@/components/landing/HeroBoard'
import { AlgorithmShowcase } from '@/components/landing/AlgorithmShowcase'
import { ComparePreview } from '@/components/landing/ComparePreview'
import { SectionHeading } from '@/components/landing/SectionHeading'

const LEARN_CARDS = [
  {
    icon: Layers,
    title: 'Every step is instrumented',
    body: 'Each algorithm returns its expansion order, frontier size at every step and the reconstructed path. The board replays that trace — you are watching the real search, not a scripted animation.',
  },
  {
    icon: Workflow,
    title: 'Theory you can poke at',
    body: 'Paint weighted terrain and watch Dijkstra reroute while BFS walks straight through it. Switch A* to a weaker heuristic and see the explored area swell. The trade-offs stop being abstract.',
  },
  {
    icon: GitCompareArrows,
    title: 'Measured, not asserted',
    body: 'Nodes visited, edges relaxed, peak frontier size and wall-clock execution time are captured per run, so complexity claims come with evidence from your own board.',
  },
]

const STACK = [
  { icon: Cpu, label: 'React 18 + Vite', detail: 'Component UI, Web Worker search, zero pathfinding dependencies' },
  { icon: Server, label: 'Django + DRF', detail: 'JWT auth, run history, saved boards, aggregate statistics' },
  { icon: Boxes, label: 'REST API', detail: 'Documented with OpenAPI 3 and browsable through Swagger UI' },
  { icon: Database, label: 'SQL Server', detail: 'Normalised schema through the Django ORM with indexed lookups' },
]

export default function LandingPage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-hairline">
        <div className="surface-grid absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[52rem] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(99,102,241,0.22) 0%, rgba(8,9,10,0) 65%)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-elevated px-2.5 py-1 text-2xs text-ink-muted">
              <Sparkles className="h-3 w-3 text-accent-soft" aria-hidden />
              Six algorithms · implemented from scratch
            </span>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              Understand Algorithms.
              <br />
              <span className="text-gradient">See Them Think.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              An interactive pathfinding laboratory for exploring BFS, DFS, Dijkstra, A*, and more.
              Draw a board, pick a strategy, and watch the frontier expand one node at a time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/visualizer" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
                Launch Visualizer
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/algorithms" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
                Explore Algorithms
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-hairline pt-6">
              {[
                { value: '6', label: 'Search algorithms' },
                { value: '4', label: 'Maze generators' },
                { value: '2.3k', label: 'Cells per board' },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-xl font-semibold text-ink">{item.value}</dt>
                  <dd className="mt-1 text-2xs text-ink-faint">{item.label}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroBoard />
          </motion.div>
        </div>
      </section>

      {/* Explore algorithms */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Explore Algorithms"
            title="One board, six ways to search it"
            description="Every implementation exposes the same execution envelope — visited order, frontier size, reconstructed path and cost — so the visualiser stays generic and adding a seventh algorithm is a single module."
          />
          <div className="mt-8">
            <AlgorithmShowcase />
          </div>
        </div>
      </section>

      {/* Compare performance */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Compare Performance"
              title="Run them against the same problem"
              description="The comparison page executes every selected algorithm on the exact board you drew, then charts nodes visited, execution time and path cost side by side. Same maze, same start, same target — the only variable is the strategy."
            />
            <ul className="mt-6 space-y-3">
              {[
                'Identical input board for every algorithm — no cherry-picking',
                'Bar charts for nodes visited and execution time, plus path cost',
                'Automatic verdict: fewest expansions, cheapest path, fastest run',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/compare"
              className={buttonStyles({ variant: 'secondary', size: 'md', className: 'mt-7' })}
            >
              Open comparison
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          <ComparePreview />
        </div>
      </section>

      {/* Learn visually */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
          <SectionHeading
            eyebrow="Learn Visually"
            title="Where complexity analysis meets the screen"
            description="This project connects the analysis you do on paper with something you can watch. The asymptotics are the point; the animation is how they become obvious."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {LEARN_CARDS.map((card) => (
              <div key={card.title} className="rounded-card border border-hairline bg-panel p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-hairline bg-elevated">
                  <card.icon className="h-4 w-4 text-accent-soft" aria-hidden />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{card.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for developers */}
      <section className="border-b border-hairline">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading
            eyebrow="Built For Developers"
            title="A full-stack product, not a class exercise"
            description="Search runs client-side on a Web Worker so the animation never stutters. Django owns identity, persistence and aggregation behind a documented REST API backed by SQL Server."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {STACK.map((item) => (
              <div
                key={item.label}
                className="rounded-card border border-hairline bg-panel p-4 transition-colors hover:border-hairline-strong"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-ink-faint" aria-hidden />
                  <p className="font-mono text-xs font-medium text-ink">{item.label}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-faint">{item.detail}</p>
              </div>
            ))}
            <Link
              to="/technical"
              className="flex items-center justify-between gap-2 rounded-card border border-accent/25 bg-accent/[0.07] p-4 transition-colors hover:bg-accent/[0.12] sm:col-span-2"
            >
              <span>
                <span className="flex items-center gap-2 font-mono text-xs font-medium text-accent-soft">
                  <LineChart className="h-3.5 w-3.5" aria-hidden />
                  Technical details
                </span>
                <span className="mt-1.5 block text-xs text-ink-muted">
                  Graph representation, priority queue design, heuristics, maze generation and the
                  full complexity analysis.
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-accent-soft" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Draw a maze. Pick an algorithm. Watch it think.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
          No account needed to use the visualiser — everything runs in your browser. Sign in only if
          you want your runs, boards and analytics kept.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/visualizer" className={buttonStyles({ variant: 'primary', size: 'lg' })}>
            Launch Visualizer
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link to="/compare" className={buttonStyles({ variant: 'secondary', size: 'lg' })}>
            Compare algorithms
          </Link>
        </div>
      </section>
    </div>
  )
}
