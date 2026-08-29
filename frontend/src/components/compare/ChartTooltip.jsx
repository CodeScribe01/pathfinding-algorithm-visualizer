/** Panel-styled tooltip shared by every comparison chart. */
export function ChartTooltip({ active, payload, label, formatter, unit }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const value = formatter ? formatter(entry.value) : entry.value

  return (
    <div className="rounded-md border border-hairline bg-raised px-2.5 py-2 shadow-pop">
      <p className="flex items-center gap-1.5 text-2xs font-medium text-ink">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: entry.payload?.accent ?? '#6366f1' }}
          aria-hidden
        />
        {label}
      </p>
      <p className="mt-1 font-mono text-xs tabular-nums text-ink-muted">
        {value}
        {unit ? <span className="ml-1 text-ink-ghost">{unit}</span> : null}
      </p>
    </div>
  )
}

export default ChartTooltip
