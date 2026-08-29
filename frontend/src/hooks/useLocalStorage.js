import { useCallback, useState } from 'react'

/** Persisted state with a safe fallback when storage is unavailable. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      return initialValue
    }
  })

  const update = useCallback(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? next(current) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          /* quota or private mode — keep the in-memory value */
        }
        return resolved
      })
    },
    [key],
  )

  return [value, update]
}
