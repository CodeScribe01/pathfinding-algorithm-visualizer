import { useCallback, useEffect, useRef } from 'react'
import { runAlgorithm } from '@/algorithms'

/**
 * Runs searches on a Web Worker, falling back to the main thread when workers
 * are unavailable (older browsers, some sandboxed embeds).
 *
 * The worker is created lazily on first use and reused for the lifetime of the
 * component, so racing six algorithms on the comparison page costs one worker,
 * not six. Jobs are correlated by an incrementing id; results for superseded
 * jobs are dropped so a fast "stop and re-run" never paints stale output.
 */
export function usePathfinder() {
  const workerRef = useRef(null)
  const pendingRef = useRef(new Map())
  const jobIdRef = useRef(0)
  const supportedRef = useRef(typeof Worker !== 'undefined')

  const ensureWorker = useCallback(() => {
    if (!supportedRef.current) return null
    if (workerRef.current) return workerRef.current

    try {
      const worker = new Worker(new URL('../workers/pathfinder.worker.js', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (event) => {
        const { jobId, ok, result, error } = event.data
        const pending = pendingRef.current.get(jobId)
        if (!pending) return
        pendingRef.current.delete(jobId)
        if (ok) pending.resolve(result)
        else pending.reject(new Error(error))
      }

      worker.onerror = () => {
        // Degrade gracefully: tear the worker down and use the sync path.
        supportedRef.current = false
        workerRef.current = null
        pendingRef.current.forEach((pending) => pending.reject(new Error('Worker failed')))
        pendingRef.current.clear()
      }

      workerRef.current = worker
      return worker
    } catch {
      supportedRef.current = false
      return null
    }
  }, [])

  useEffect(
    () => () => {
      workerRef.current?.terminate()
      workerRef.current = null
      pendingRef.current.clear()
    },
    [],
  )

  /**
   * @param {string} algorithm  catalogue id
   * @param {{rows,cols,walls,weights}} encoded  output of encodeGrid()
   * @returns {Promise<object>} standard result envelope
   */
  const run = useCallback(
    (algorithm, encoded, source, target, options = {}) => {
      const worker = ensureWorker()

      if (!worker) {
        // Synchronous fallback — still returns a promise so callers are uniform.
        return new Promise((resolve, reject) => {
          try {
            resolve(runAlgorithm(algorithm, encoded, source, target, options))
          } catch (error) {
            reject(error)
          }
        })
      }

      jobIdRef.current += 1
      const jobId = jobIdRef.current

      return new Promise((resolve, reject) => {
        pendingRef.current.set(jobId, { resolve, reject })
        worker.postMessage({
          jobId,
          algorithm,
          rows: encoded.rows,
          cols: encoded.cols,
          walls: encoded.walls,
          weights: encoded.weights,
          source,
          target,
          options,
        })
      })
    },
    [ensureWorker],
  )

  /** Drop every in-flight job (used when the board changes mid-search). */
  const cancelAll = useCallback(() => {
    pendingRef.current.forEach((pending) => pending.reject(new Error('cancelled')))
    pendingRef.current.clear()
  }, [])

  return { run, cancelAll, isWorkerSupported: supportedRef.current }
}
