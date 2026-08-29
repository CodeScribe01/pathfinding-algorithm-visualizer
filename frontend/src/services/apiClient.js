import { STORAGE_KEYS } from '@/lib/constants'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(
  /\/$/,
  '',
)

/** Normalised transport error: everything the UI needs to render a message. */
export class ApiError extends Error {
  constructor(message, { status = 0, details = null, isNetwork = false } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
    this.isNetwork = isNetwork
  }

  /** First readable message for a given form field, if the API returned one. */
  fieldError(field) {
    const value = this.details?.[field]
    if (!value) return null
    return Array.isArray(value) ? value[0] : String(value)
  }
}

export const tokenStore = {
  get access() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS)
  },
  get refresh() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH)
  },
  set({ access, refresh }) {
    if (access) localStorage.setItem(STORAGE_KEYS.ACCESS, access)
    if (refresh) localStorage.setItem(STORAGE_KEYS.REFRESH, refresh)
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS)
    localStorage.removeItem(STORAGE_KEYS.REFRESH)
    localStorage.removeItem(STORAGE_KEYS.USER)
  },
}

/** Turn a DRF error body into a single human sentence. */
function describe(payload, status) {
  if (!payload) return `Request failed (${status})`
  if (typeof payload === 'string') return payload
  if (payload.detail) return payload.detail
  const firstKey = Object.keys(payload)[0]
  if (!firstKey) return `Request failed (${status})`
  const value = payload[firstKey]
  const message = Array.isArray(value) ? value[0] : String(value)
  return firstKey === 'non_field_errors' ? message : `${firstKey}: ${message}`
}

async function parseBody(response) {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

let refreshInFlight = null

async function refreshAccessToken() {
  const refresh = tokenStore.refresh
  if (!refresh) return null

  // Collapse parallel 401s into a single refresh round-trip.
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (response) => {
        if (!response.ok) return null
        const data = await parseBody(response)
        if (data?.access) {
          tokenStore.set({ access: data.access, refresh: data.refresh })
          return data.access
        }
        return null
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

/**
 * Single entry point for every backend call.
 *
 * Handles JSON encoding, bearer auth, one transparent token refresh on 401 and
 * error normalisation, so feature modules stay four lines long.
 */
export async function request(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const accessToken = tokenStore.access
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'Cannot reach the PathForge API. Is the Django server running?',
      { isNetwork: true },
    )
  }

  if (response.status === 401 && auth && retry && tokenStore.refresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return request(path, { method, body, auth, retry: false })
    tokenStore.clear()
  }

  const payload = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(describe(payload, response.status), {
      status: response.status,
      details: typeof payload === 'object' ? payload : null,
    })
  }

  return payload
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
