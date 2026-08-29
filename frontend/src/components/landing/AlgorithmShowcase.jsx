import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ALGORITHM_LIST } from '@/algorithms'
import { Badge } from '@/components/ui'

/** Landing grid of algorithm cards, driven by the same catalogue as the app. */
export function AlgorithmShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ALGORITHM_LIST.map((algorithm, index) => (
        <motion.div
          key={algorithm.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            to={`/visualizer?algorithm=${algorithm.id}`}
            className="group flex h-full flex-col rounded-card border border-hairline bg-panel p-4 transition-colors hover:border-hairline-strong hover:bg-elevated"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: algorithm.accent }}
                  aria-hidden
                />
                <h3 className="text-sm font-semibold text-ink">{algorithm.name}</h3>
              </div>
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-ink-ghost transition-all group-hover:translate-x-0.5 group-hover:text-ink-muted"
                aria-hidden
              />
            </div>

            <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-muted">
              {algorithm.tagline}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge mono tone="neutral">
                {algorithm.timeComplexity}
              </Badge>
              {algorithm.guaranteesShortestPath ? (
                <Badge tone="success">Optimal</Badge>
              ) : (
                <Badge tone="warning">Heuristic</Badge>
              )}
              {algorithm.weighted ? <Badge tone="info">Weighted</Badge> : null}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

export default AlgorithmShowcase
