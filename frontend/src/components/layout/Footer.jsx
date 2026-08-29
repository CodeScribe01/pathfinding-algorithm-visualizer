import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { GITHUB_URL } from '@/lib/constants'
import { Wordmark } from './Logo'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Visualizer', to: '/visualizer' },
      { label: 'Algorithms', to: '/algorithms' },
      { label: 'Compare', to: '/compare' },
      { label: 'Analytics', to: '/analytics' },
    ],
  },
  {
    title: 'Engineering',
    links: [
      { label: 'Technical details', to: '/technical' },
      { label: 'Run history', to: '/history' },
      { label: 'Saved boards', to: '/grids' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            An interactive pathfinding laboratory. Six search algorithms implemented from scratch,
            instrumented step by step, and rendered on a live grid so the theory becomes visible.
          </p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
          >
            <Github className="h-3.5 w-3.5" aria-hidden />
            github.com/CodeScribe01/pathfinding-algorithm-visualizer
          </a>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="label-caps mb-3">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-xs text-ink-faint transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="label-caps mb-3">Built with</p>
          <ul className="space-y-2 font-mono text-xs text-ink-faint">
            <li>React 18 · Vite</li>
            <li>Tailwind CSS · Framer Motion</li>
            <li>Django REST Framework · JWT</li>
            <li>Microsoft SQL Server</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-5 text-2xs text-ink-ghost sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>PathForge — Analysis of Algorithms coursework project.</p>
          <p className="font-mono">
            Algorithms implemented from scratch. No pathfinding libraries used.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
