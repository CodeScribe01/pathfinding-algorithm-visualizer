import { LEGEND_ITEMS } from '@/lib/nodeState'
import { Tooltip } from '@/components/ui'

/** Colour key for the board. Swatches reuse the real cell styles. */
export function Legend({ className }) {
  return (
    <ul className={className}>
      {LEGEND_ITEMS.map((item) => (
        <li key={item.state} className="inline-flex">
          <Tooltip label={item.description}>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="node !h-3 !w-3 shrink-0 rounded-[2px] border-0"
                data-state={item.state}
                aria-hidden
              />
              <span className="text-2xs text-ink-faint">{item.label}</span>
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
  )
}

export default Legend
