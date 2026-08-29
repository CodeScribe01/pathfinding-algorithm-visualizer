/**
 * Pathfinding worker.
 *
 * Search runs off the main thread so that painting a maze, running a 33x71
 * board or racing six algorithms on the comparison page never blocks input or
 * animation. The worker owns no state: each message is a self-contained job.
 *
 * Message in:  { jobId, algorithm, rows, cols, walls, weights, source, target, options }
 * Message out: { jobId, ok, result } | { jobId, ok: false, error }
 */
import { runAlgorithm } from '@/algorithms'

self.onmessage = (event) => {
  const { jobId, algorithm, rows, cols, walls, weights, source, target, options } = event.data

  try {
    const result = runAlgorithm(
      algorithm,
      { rows, cols, walls: new Uint8Array(walls), weights: new Uint8Array(weights) },
      source,
      target,
      options,
    )
    self.postMessage({ jobId, ok: true, result })
  } catch (error) {
    self.postMessage({ jobId, ok: false, error: error?.message ?? 'Search failed' })
  }
}
