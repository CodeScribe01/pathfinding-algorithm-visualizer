import { api, tokenStore } from './apiClient'
import { STORAGE_KEYS } from '@/lib/constants'

/** Auth surface. JWT pairs live in localStorage; the user object is cached
 *  alongside them so a refresh does not flash an empty navbar. */
export const authService = {
  async register({ username, email, password }) {
    const data = await api.post('/auth/register/', { username, email, password }, { auth: false })
    if (data?.access) tokenStore.set(data)
    if (data?.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
    return data
  },

  async login({ username, password }) {
    const data = await api.post('/auth/login/', { username, password }, { auth: false })
    tokenStore.set(data)
    if (data?.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user))
    return data
  },

  async me() {
    const user = await api.get('/auth/me/')
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    return user
  },

  async logout() {
    const refresh = tokenStore.refresh
    try {
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch {
      /* server-side blacklist is best-effort; local tokens go regardless */
    }
    tokenStore.clear()
  },

  cachedUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  get isAuthenticated() {
    return Boolean(tokenStore.access)
  },
}
