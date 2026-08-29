import { api } from './apiClient'

/**
 * Visualisation run history.
 *
 * `create` maps the frontend result envelope onto the snake_case API contract
 * in exactly one place, so the algorithm layer never learns about the backend.
 */
export const runsService = {
  list: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== ''),
    ).toString()
    return api.get(`/runs/${query ? `?${query}` : ''}`)
  },

  retrieve: (id) => api.get(`/runs/${id}/`),

  remove: (id) => api.delete(`/runs/${id}/`),

  create: ({ algorithm, rows, cols, result, mazeType = null, heuristic = null }) =>
    api.post('/runs/', {
      algorithm,
      grid_rows: rows,
      grid_columns: cols,
      nodes_visited: result.nodesVisited,
      path_length: result.pathLength,
      path_cost: result.pathCost,
      execution_time: Number(result.executionTime.toFixed(3)),
      path_found: result.found,
      max_frontier_size: result.maxFrontier,
      maze_type: mazeType,
      heuristic,
    }),
}
