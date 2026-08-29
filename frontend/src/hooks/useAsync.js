import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Minimal data-fetching hook covering the three states every list screen needs:
 * loading, error and data. Deliberately tiny — the project has one API surface
 * and does not need a query cache.
 *
 * @param {Function} asyncFn      returns a promise
 * @param {Array} deps            re-run when these change
 * @param {{immediate?: boolean}} options
 */
export function useAsync(asyncFn, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: immediate })
  const mountedRef = useRef(true)
  const callbackRef = useRef(asyncFn)
  callbackRef.current = asyncFn

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(async (...args) => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await callbackRef.current(...args)
      if (mountedRef.current) setState({ data, error: null, loading: false })
      return data
    } catch (error) {
      if (mountedRef.current) setState({ data: null, error, loading: false })
      throw error
    }
  }, [])

  useEffect(() => {
    if (!immediate) return
    execute().catch(() => {
      /* surfaced through state.error */
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ...state, execute, setData: (data) => setState((s) => ({ ...s, data })) }
}
