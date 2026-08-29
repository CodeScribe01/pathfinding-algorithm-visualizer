import { Check } from 'lucide-react'
import { ALGORITHM_LIST } from '@/algorithms'
import { cn } from '@/lib/cn'

/** Multi-select chips choosing which algorithms enter the comparison. */
export function AlgorithmPicker({ selected, onToggle }) {
  return (
    <fieldset>
      <legend className="label-caps mb-2">Algorithms in this comparison</legend>
      <div className="flex flex-wrap gap-2">
        {ALGORITHM_LIST.map((algorithm) => {
          const isSelected = selected.includes(algorithm.id)
          return (
            <label
              key={algorithm.id}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                isSelected
                  ? 'border-accent/40 bg-accent/10 text-ink'
                  : 'border-hairline bg-elevated text-ink-faint hover:border-hairline-strong hover:text-ink-muted',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isSelected}
                onChange={() => onToggle(algorithm.id)}
              />
              <span
                className={cn(
                  'flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border',
                  isSelected ? 'border-transparent bg-accent' : 'border-hairline-strong',
                )}
                aria-hidden
              >
                {isSelected ? <Check className="h-2.5 w-2.5 text-white" /> : null}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: algorithm.accent }}
                aria-hidden
              />
              {algorithm.shortName}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export default AlgorithmPicker
