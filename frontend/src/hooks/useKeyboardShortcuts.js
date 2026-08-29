import { useEffect } from 'react'

/**
 * Global keyboard shortcuts.
 *
 * Keys are ignored while the user is typing in an input, textarea or any
 * contenteditable region so the visualiser shortcuts never hijack a form.
 *
 * @param {Record<string, Function>} bindings  e.g. { ' ': togglePlay, r: reset }
 * @param {boolean} enabled
 */
export function useKeyboardShortcuts(bindings, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const onKeyDown = (event) => {
      const target = event.target
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const handler = bindings[event.key] ?? bindings[event.key.toLowerCase()]
      if (!handler) return
      event.preventDefault()
      handler(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [bindings, enabled])
}
