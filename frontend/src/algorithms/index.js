import { bfs } from './bfs.js'
import { dfs } from './dfs.js'
import { dijkstra } from './dijkstra.js'
import { astar } from './astar.js'
import { greedyBestFirst } from './greedy.js'
import { bidirectionalBfs } from './bidirectional.js'

export { MinHeap } from './MinHeap.js'
export { HEURISTICS, DEFAULT_HEURISTIC } from './heuristics.js'
export { WEIGHT_COST, DIRECTIONS } from './utils.js'
export {
  ALGORITHM_LIST,
  ALGORITHM_MAP,
  ALGORITHM_IDS,
  getAlgorithmMeta,
  DEFAULT_ALGORITHM,
} from './metadata.js'

/**
 * Registry mapping catalogue ids to implementations. Adding an algorithm means
 * dropping a module here and a card in metadata.js — no UI change required.
 */
export const ALGORITHM_RUNNERS = {
  bfs,
  dfs,
  dijkstra,
  astar,
  greedy: greedyBestFirst,
  bidirectional: bidirectionalBfs,
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Execute an algorithm against an encoded grid and stamp the measured wall
 * clock time onto the standard result envelope.
 *
 * @param {string} algorithmId          catalogue id, e.g. 'astar'
 * @param {object} grid                 { rows, cols, walls, weights }
 * @param {number} source               flat index of the start node
 * @param {number} target               flat index of the target node
 * @param {object} [options]            e.g. { heuristic: 'manhattan' }
 * @returns {{visitedOrder: Array, path: Array, pathCost: number,
 *            pathLength: number, nodesVisited: number, maxFrontier: number,
 *            operations: number, found: boolean, executionTime: number,
 *            algorithm: string}}
 */
export function runAlgorithm(algorithmId, grid, source, target, options = {}) {
  const runner = ALGORITHM_RUNNERS[algorithmId]
  if (!runner) throw new Error(`Unknown algorithm: ${algorithmId}`)

  const startedAt = now()
  const result = runner(grid, source, target, options)
  result.executionTime = now() - startedAt
  result.algorithm = algorithmId
  return result
}
