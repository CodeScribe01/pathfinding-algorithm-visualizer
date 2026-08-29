import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Range input styled to match the panel chrome. */
export function Slider({ label, value, min, max, step = 1, onChange, format, className, id }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const percent = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <div className="flex items-baseline justify-between">
          <label htmlFor={inputId} className="label-caps">
            {label}
          </label>
          <span className="font-mono text-2xs text-ink-muted">
            {format ? format(value) : value}
          </span>
        </div>
      ) : null}
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange?.(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline-strong outline-none
          [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-canvas
          [&::-webkit-slider-thumb]:bg-accent-soft [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent-soft"
        style={{
          background: `linear-gradient(to right, #6366f1 ${percent}%, #2a3038 ${percent}%)`,
        }}
      />
    </div>
  )
}

export default Slider
