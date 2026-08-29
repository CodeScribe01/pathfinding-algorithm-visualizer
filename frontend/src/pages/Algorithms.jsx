import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui'
import { AlgorithmCard } from '@/components/algorithms/AlgorithmCard'
import { ALGORITHM_LIST } from '@/algorithms'
import { cn } from '@/lib/cn'

/**
 * Reference page. `?focus=<id>` (used by the visualiser's "Full breakdown"
 * link) scrolls to and highlights a specific algorithm.
 */
export default function AlgorithmsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const focusId = searchParams.get('focus')
  const [active, setActive] = useState(focusId ?? ALGORITHM_LIST[0].id)

  useEffect(() => {
    if (!focusId) return
    const element = document.getElementById(focusId)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(focusId)
  }, [focusId])

  const handleJump = (id) => {
    setActive(id)
    setSearchParams({ focus: id })
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Reference"
        title="Algorithms"
        description="Every search implemented in PathForge, with the complexity analysis, the data structure it leans on, when it is the right tool and the pseudocode the implementation follows."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="hidden lg:block" aria-label="Algorithm index">
          <ul className="sticky top-20 space-y-0.5">
            {ALGORITHM_LIST.map((algorithm) => (
              <li key={algorithm.id}>
                <button
                  type="button"
                  onClick={() => handleJump(algorithm.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors',
                    active === algorithm.id
                      ? 'bg-elevated text-ink'
                      : 'text-ink-faint hover:text-ink-muted',
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: algorithm.accent }}
                    aria-hidden
                  />
                  <span className="truncate">{algorithm.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          {ALGORITHM_LIST.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.id}
              algorithm={algorithm}
              highlighted={focusId === algorithm.id}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
