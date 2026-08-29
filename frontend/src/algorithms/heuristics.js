/**
 * Heuristic functions for informed search.
 *
 * A* only guarantees an optimal path when the heuristic is *admissible*: it
 * must never over-estimate the true remaining cost. Because movement is
 * 4-directional and the cheapest possible step costs 1, Manhattan distance is
 * both admissible and consistent — so A* on this board returns the same optimal
 * cost as Dijkstra while expanding far fewer nodes.
 *
 * Euclidean distance is also admissible here but weaker (it under-estimates
 * more), and Chebyshev would only be appropriate with diagonal movement — both
 * are exposed so the UI can demonstrate the trade-off.
 */
export const HEURISTICS = {
  manhattan: {
    id: 'manhattan',
    label: 'Manhattan',
    formula: '|dx| + |dy|',
    admissible: true,
    fn: (r1, c1, r2, c2) => Math.abs(r1 - r2) + Math.abs(c1 - c2),
  },
  euclidean: {
    id: 'euclidean',
    label: 'Euclidean',
    formula: '√(dx² + dy²)',
    admissible: true,
    fn: (r1, c1, r2, c2) => Math.hypot(r1 - r2, c1 - c2),
  },
  chebyshev: {
    id: 'chebyshev',
    label: 'Chebyshev',
    formula: 'max(|dx|, |dy|)',
    admissible: true,
    fn: (r1, c1, r2, c2) => Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2)),
  },
}

export const DEFAULT_HEURISTIC = 'manhattan'

export const getHeuristic = (id) => (HEURISTICS[id] ?? HEURISTICS[DEFAULT_HEURISTIC]).fn
