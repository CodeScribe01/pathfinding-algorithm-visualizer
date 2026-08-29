import { api } from './apiClient'

/** Aggregate analytics for the signed-in user (computed server side). */
export const statisticsService = {
  fetch: () => api.get('/statistics/'),
}
