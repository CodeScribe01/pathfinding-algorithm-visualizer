import { api } from './apiClient'
import { serializeGrid } from '@/lib/grid'

/** Saved boards. `grid_data` is the compact wall/weight index payload. */
export const gridsService = {
  list: () => api.get('/grids/'),

  retrieve: (id) => api.get(`/grids/${id}/`),

  remove: (id) => api.delete(`/grids/${id}/`),

  create: ({ name, grid, start, target }) =>
    api.post('/grids/', {
      name,
      grid_data: serializeGrid(grid),
      start_position: { row: start.row, col: start.col },
      target_position: { row: target.row, col: target.col },
    }),
}
