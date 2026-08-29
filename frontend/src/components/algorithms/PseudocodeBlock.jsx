import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Tooltip } from '@/components/ui'

/** Monospaced pseudocode with copy-to-clipboard. */
export function PseudocodeBlock({ code, label = 'Pseudocode' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked — the code is selectable anyway */
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-hairline bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline px-3 py-1.5">
        <span className="label-caps">{label}</span>
        <Tooltip label={copied ? 'Copied' : 'Copy pseudocode'}>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy pseudocode"
            className="rounded p-1 text-ink-ghost transition-colors hover:bg-elevated hover:text-ink"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
        </Tooltip>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[11.5px] leading-[1.65] text-ink-muted">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default PseudocodeBlock
